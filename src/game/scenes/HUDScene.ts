import Phaser from "phaser";
import { gameStore } from "../../store/gameStore";
import {
    GameEvents,
    ItemData,
    SkillData,
    QuestData,
    MapData,
} from "../data/types";
import { MAP_SCENE_KEYS } from "../data/mapSceneKeys";

export class HUDScene extends Phaser.Scene {
    private coinText!: Phaser.GameObjects.Text;
    private questTracker!: Phaser.GameObjects.Text;
    private activeToolText!: Phaser.GameObjects.Text;
    private activeToolIcon!: Phaser.GameObjects.Image;
    private uiContainer!: Phaser.GameObjects.Container;
    private overlayBg!: Phaser.GameObjects.Rectangle;
    private isOverlayOpen = false;
    private inputEl!: HTMLInputElement;
    private keyboardGuard = false;
    private _prevPadStart = false;
    private _prevPadB = false;
    private _prevPadY = false;

    constructor() {
        super({ key: "HUDScene" });
    }

    create() {
        const { width, height } = this.cameras.main;

        const panelW = 230;
        const panelCX = width - 150;

        // Coins
        this.add.image(panelCX, 28, "hud_panel").setDisplaySize(panelW, 38);
        this.coinText = this.add
            .text(
                panelCX - panelW / 2 + 16,
                28,
                `$ ${gameStore.getState().playerData.coins}`,
                {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "11px",
                    color: "#fdcb6e",
                },
            )
            .setOrigin(0, 0.5);

        // Current Quest (right side, below coins and player name)
        this.add.image(panelCX, 138, "hud_panel").setDisplaySize(panelW, 58);
        this.add.text(panelCX - panelW / 2 + 16, 117, "Current Quest", {
            fontFamily: '"Inter"',
            fontSize: "11px",
            color: "#f39c12",
            fontStyle: "bold",
        });
        this.questTracker = this.add.text(
            panelCX - panelW / 2 + 16,
            135,
            "Explore the village.",
            {
                fontFamily: '"Inter"',
                fontSize: "12px",
                color: "#dfe6e9",
                wordWrap: { width: panelW - 32 },
            },
        );

        // Buttons
        this.createMiniBtn(width - 40, height - 40, "M", "Map", () =>
            this.showOverlay("map"),
        );
        this.createMiniBtn(width - 90, height - 40, "K", "Skills", () =>
            this.showOverlay("skills"),
        );
        this.createMiniBtn(width - 140, height - 40, "I", "Inventory", () =>
            this.showOverlay("inventory"),
        );
        this.createMiniBtn(width - 190, height - 40, "Q", "Quests", () =>
            this.showOverlay("quests"),
        );
        this.createMiniBtn(width - 240, height - 40, "C", "ChemDex", () =>
            this.showOverlay("chemdex"),
        );
        this.createMiniBtn(width - 290, height - 40, "⛶", "Fullscreen", () =>
            this.toggleFullscreen(),
        );

        // Active Tool (right column, above buttons)
        this.add
            .image(panelCX, height - 85, "hud_panel")
            .setDisplaySize(panelW, 36);
        this.activeToolIcon = this.add
            .image(panelCX - panelW / 2 + 24, height - 85, "icon_particle")
            .setDisplaySize(20, 20);
        this.activeToolText = this.add
            .text(panelCX + panelW / 2 - 16, height - 85, "None\n[T]", {
                fontFamily: '"Inter"',
                fontSize: "10px",
                color: "#fff",
                align: "center",
            })
            .setOrigin(1, 0.5);

        // Keyboard shortcuts (guarded so they don't fire while typing)
        const guard = (fn: () => void) => () => {
            if (!this.keyboardGuard) fn();
        };

        if (this.input.keyboard) {
            this.input.keyboard.on(
                "keydown-I",
                guard(() => this.toggleOverlay("inventory")),
            );
            this.input.keyboard.on(
                "keydown-Q",
                guard(() => this.toggleOverlay("quests")),
            );
            this.input.keyboard.on(
                "keydown-K",
                guard(() => this.toggleOverlay("skills")),
            );
            this.input.keyboard.on(
                "keydown-C",
                guard(() => this.toggleOverlay("chemdex")),
            );
            this.input.keyboard.on(
                "keydown-M",
                guard(() => this.toggleOverlay("map")),
            );
            this.input.keyboard.on(
                "keydown-T",
                guard(() => this.cycleTool()),
            );
            this.input.keyboard.on(
                "keydown-ESC",
                guard(() => this.closeOverlay()),
            );
            this.input.keyboard.on(
                "keydown-F",
                guard(() => this.toggleFullscreen()),
            );
        }

        // Subscribe to store
        const unsub = gameStore.subscribe(() => this.updateHUD());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

        // Overlay container
        this.overlayBg = this.add
            .rectangle(0, 0, width, height, 0x000, 0.8)
            .setOrigin(0)
            .setAlpha(0);
        this.overlayBg.setInteractive(); // block clicks
        this.overlayBg.on("pointerdown", () => this.closeOverlay());

        this.uiContainer = this.add
            .container(width / 2, height / 2)
            .setAlpha(0);

        // Username input (DOM overlay on the right side)
        this.createUsernameInput();

        this.updateHUD();

        // Notifications - use game-wide event bus (works across all scenes)
        this.game.events.on(GameEvents.Notification, (data: { title: string; message: string; icon: string }) => {
            this.showNotification(data);
        });
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.game.events.off(GameEvents.Notification);
        });

        // Custom events
        window.addEventListener("chemicraft:notification", (e: any) => {
            this.showNotification({
                title: "System",
                message: e.detail.message,
                icon: "💡",
            });
        });
    }

    update() {
        const pad = this.input.gamepad?.pad1;
        if (!pad) return;

        // Button indices: 9=Start, 1=B, 3=Y
        const startPressed = pad.buttons[9]?.pressed ?? false;
        const bPressed = pad.buttons[1]?.pressed ?? false;
        const yPressed = pad.buttons[3]?.pressed ?? false;

        if (startPressed && !this._prevPadStart) {
            if (this.isOverlayOpen) this.closeOverlay();
            else this.toggleOverlay('inventory');
        }
        if (bPressed && !this._prevPadB) this.closeOverlay();
        if (yPressed && !this._prevPadY) this.toggleOverlay('map');

        this._prevPadStart = startPressed;
        this._prevPadB = bPressed;
        this._prevPadY = yPressed;
    }

    private getActiveMapScene(): Phaser.Scene | null {
        const mapKeys = Object.values(MAP_SCENE_KEYS);
        for (const key of mapKeys) {
            const scene = this.scene.get(key);
            if (scene && scene.scene.isActive()) return scene;
        }
        return null;
    }

    private createUsernameInput() {
        const { width } = this.cameras.main;
        const panelW = 230;
        const panelCX = width - 150;

        this.add.image(panelCX, 78, "hud_panel").setDisplaySize(panelW, 44);
        this.add.text(panelCX - panelW / 2 + 16, 62, "PLAYER", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "7px",
            color: "#f39c12",
            letterSpacing: 1,
        });

        const updatePosition = () => {
            const canvas = document.querySelector("canvas");
            if (!canvas) return;
            const r = canvas.getBoundingClientRect();
            const sx = r.width / 960,
                sy = r.height / 640;
            const x = r.left + (panelCX - panelW / 2 + 16) * sx;
            const y = r.top + 76 * sy;
            const w = (panelW - 32) * sx;

            this.inputEl.style.left = x + "px";
            this.inputEl.style.top = y + "px";
            this.inputEl.style.width = w + "px";
        };

        this.inputEl = document.createElement("input");
        this.inputEl.type = "text";
        this.inputEl.value = gameStore.getState().playerData.username;
        this.inputEl.style.cssText = `
      position: fixed; z-index: 500;
      padding: 4px 0; font-size: 14px; font-weight: 500;
      background: transparent; border: none; outline: none;
      color: #dfe6e9; font-family: "Inter", sans-serif;
      caret-color: #f39c12;
    `;

        this.inputEl.addEventListener("focus", () => {
            this.inputEl.style.color = "#ffffff";
            this.keyboardGuard = true;
            gameStore.setPaused(true);
            this.inputEl.dataset.originalValue = this.inputEl.value;
        });

        this.inputEl.addEventListener("blur", () => {
            this.inputEl.style.color = "#dfe6e9";
            this.keyboardGuard = false;
            gameStore.setPaused(false);
            const val = this.inputEl.value.trim();
            if (val) gameStore.setUsername(val);
        });

        this.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === "Enter") this.inputEl.blur();
            if (e.key === "Escape") {
                this.inputEl.value =
                    this.inputEl.dataset.originalValue || this.inputEl.value;
                this.inputEl.blur();
            }
        });

        document.body.appendChild(this.inputEl);
        updatePosition();

        document.addEventListener("fullscreenchange", updatePosition);
        document.addEventListener("webkitfullscreenchange", updatePosition);

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("fullscreenchange", updatePosition);
            document.removeEventListener("webkitfullscreenchange", updatePosition);
            if (this.inputEl.parentNode)
                this.inputEl.parentNode.removeChild(this.inputEl);
        });
    }

    private updateHUD() {
        const state = gameStore.getState();
        this.coinText.setText(`$ ${state.playerData.coins}`);

        // Update quest tracker
        const active = state.playerData.activeQuests;
        if (active.length > 0) {
            const quests = this.cache.json.get("quests") as Record<
                string,
                QuestData
            >;
            const firstQuest = quests[active[0]];
            if (firstQuest) {
                this.questTracker.setText(
                    firstQuest.title +
                        "\n" +
                        firstQuest.objectiveType +
                        " " +
                        firstQuest.target,
                );
            }
        } else {
            this.questTracker.setText("Explore the village.");
        }

        // Update Tool
        const tool = state.playerData.activeTool;
        if (tool === "none") {
            this.activeToolText.setText("Hands\n[T]");
            this.activeToolIcon.setTexture("icon_particle").setAlpha(0.2);
        } else if (tool === "pickaxe") {
            this.activeToolText.setText("Pickaxe\n[T]");
            this.activeToolIcon.setTexture("icon_pickaxe").setAlpha(1);
        } else if (tool === "flask") {
            this.activeToolText.setText("Flask\n[T]");
            this.activeToolIcon.setTexture("icon_flask").setAlpha(1);
        }
    }

    private cycleTool() {
        const tools = ["none", "pickaxe", "flask"];
        const current = gameStore.getState().playerData.activeTool;
        const idx = tools.indexOf(current);
        const nextIdx = (idx + 1) % tools.length;
        gameStore.setActiveTool(tools[nextIdx]);
    }

    private toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    private createMiniBtn(
        x: number,
        y: number,
        key: string,
        label: string,
        cb: () => void,
    ) {
        const btn = this.add
            .circle(x, y, 20, 0x1a0e00)
            .setStrokeStyle(2, 0xf39c12)
            .setInteractive({ useHandCursor: true });
        this.add
            .text(x, y, key, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                color: "#f39c12",
            })
            .setOrigin(0.5);

        const tooltip = this.add
            .text(x, y - 30, label, {
                fontFamily: '"Inter"',
                fontSize: "10px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 4, y: 2 },
            })
            .setOrigin(0.5)
            .setAlpha(0);

        btn.on("pointerdown", cb);
        btn.on("pointerover", () => {
            tooltip.setAlpha(1);
            btn.setFillStyle(0xf39c12);
        });
        btn.on("pointerout", () => {
            tooltip.setAlpha(0);
            btn.setFillStyle(0x1a0e00);
        });
    }

    private toggleOverlay(type: string) {
        if (this.isOverlayOpen) this.closeOverlay();
        else this.showOverlay(type);
    }

    private showOverlay(type: string) {
        this.uiContainer.removeAll(true);
        gameStore.setPaused(true);
        this.isOverlayOpen = true;

        if (type === "map") {
            this.renderMap();
        } else {
            const panel = this.add.image(0, 0, "panel_bg");
            this.uiContainer.add(panel);

            const titleMap: Record<string, string> = {
                inventory: "Backpack",
                quests: "Quest Log",
                skills: "Skill Tree",
                chemdex: "ChemDex",
            };
            this.uiContainer.add(
                this.add
                    .text(0, -170, titleMap[type] || "", {
                        fontFamily: '"Press Start 2P"',
                        fontSize: "16px",
                        color: "#f39c12",
                    })
                    .setOrigin(0.5),
            );

            if (type === "inventory") this.renderInventory();
            else if (type === "quests") this.renderQuests();
            else if (type === "skills") this.renderSkills();
            else if (type === "chemdex") this.renderChemDex();
        }

        this.tweens.add({
            targets: [this.overlayBg, this.uiContainer],
            alpha: 1,
            duration: 200,
        });
    }

    private closeOverlay() {
        if (!this.isOverlayOpen) return;
        this.isOverlayOpen = false;
        gameStore.setPaused(false);
        this.tweens.add({
            targets: [this.overlayBg, this.uiContainer],
            alpha: 0,
            duration: 200,
        });
    }

    private renderInventory() {
        const items = this.cache.json.get("items") as Record<string, ItemData>;
        const inv = gameStore.getInventory();

        let x = -230,
            y = -100;
        for (const item of inv) {
            const data = items[item.itemId];
            if (!data) continue;

            const isEquipped = gameStore.isEquipped(item.itemId);

            const slot = this.add.image(x, y, "inv_slot");
            if (isEquipped) {
                slot.setTint(0x00b894); // Highlight equipped
            }

            const icon = this.add
                .text(x, y - 5, data.symbol, { fontSize: "20px" })
                .setOrigin(0.5);
            const qty = this.add
                .text(x + 15, y + 15, `${item.quantity}`, {
                    fontFamily: '"Inter"',
                    fontSize: "10px",
                    color: "#fff",
                })
                .setOrigin(1);

            slot.setInteractive({ useHandCursor: true });

            // Tooltip
            let actionLabel = data.name;
            if (data.type === "equipment") actionLabel += "\n(Click to Equip)";
            if (data.type === "consumable")
                actionLabel += "\n(Click to Consume)";

            const tooltip = this.add
                .text(x, y - 40, actionLabel, {
                    fontFamily: '"Inter"',
                    fontSize: "10px",
                    color: "#fff",
                    backgroundColor: "#000",
                    padding: { x: 4, y: 2 },
                    align: "center",
                })
                .setOrigin(0.5)
                .setAlpha(0)
                .setDepth(200);

            slot.on("pointerover", () => tooltip.setAlpha(1));
            slot.on("pointerout", () => tooltip.setAlpha(0));

            slot.on("pointerdown", () => {
                if (data.type === "equipment") {
                    // Only 1 gear can be equipped in this simple system for now, or we can just push it
                    // To simplify: clear all gear and equip this one
                    gameStore.getState().playerData.equippedGear = [];
                    gameStore.equipGear(item.itemId);
                    this.showOverlay("inventory"); // refresh
                } else if (data.type === "consumable") {
                    if (gameStore.consumeItem(item.itemId)) {
                        this.showOverlay("inventory"); // refresh
                    }
                }
            });

            this.uiContainer.add([slot, icon, qty, tooltip]);

            x += 60;
            if (x > 230) {
                x = -230;
                y += 60;
            }
        }
    }

    private renderQuests() {
        const quests = this.cache.json.get("quests") as Record<
            string,
            QuestData
        >;
        const active = gameStore.getState().playerData.activeQuests;

        let y = -120;
        if (active.length === 0) {
            this.uiContainer.add(
                this.add
                    .text(0, 0, "No active quests.", {
                        fontFamily: '"Inter"',
                        color: "#636e72",
                    })
                    .setOrigin(0.5),
            );
        }

        for (const qid of active) {
            const q = quests[qid];
            if (!q) continue;
            this.uiContainer.add(
                this.add.text(-250, y, `! ${q.title}`, {
                    fontFamily: '"Inter"',
                    fontSize: "16px",
                    color: "#f1c40f",
                    fontStyle: "bold",
                }),
            );
            this.uiContainer.add(
                this.add.text(-230, y + 25, q.description, {
                    fontFamily: '"Inter"',
                    fontSize: "12px",
                    color: "#dfe6e9",
                    wordWrap: { width: 480 },
                }),
            );
            y += 80;
        }
    }

    private renderSkills() {
        const skills = this.cache.json.get("skills") as Record<
            string,
            SkillData
        >;
        const pSkills = gameStore.getState().playerData.skills;

        let x = -150,
            y = -50;
        for (const [id, data] of Object.entries(skills)) {
            const level = pSkills[id] || 0;
            this.uiContainer.add(
                this.add
                    .text(x, y - 40, data.icon, { fontSize: "32px" })
                    .setOrigin(0.5),
            );
            this.uiContainer.add(
                this.add
                    .text(x, y - 10, data.name, {
                        fontFamily: '"Inter"',
                        fontSize: "12px",
                        color: "#f39c12",
                        fontStyle: "bold",
                    })
                    .setOrigin(0.5),
            );

            // Progress bar
            this.uiContainer.add(
                this.add.rectangle(x, y + 10, 100, 10, 0x2a1a0a).setOrigin(0.5),
            );
            if (level > 0) {
                this.uiContainer.add(
                    this.add
                        .rectangle(x - 50, y + 10, 20 * level, 10, 0x00cec9)
                        .setOrigin(0, 0.5),
                );
            }
            this.uiContainer.add(
                this.add
                    .text(x, y + 30, `Lvl ${level}/${data.maxLevel}`, {
                        fontFamily: '"Inter"',
                        fontSize: "10px",
                        color: "#fff",
                    })
                    .setOrigin(0.5),
            );

            x += 300;
            if (x > 150) {
                x = -150;
                y += 120;
            }
        }
    }

    private renderChemDex() {
        const items = this.cache.json.get("items") as Record<string, ItemData>;
        const unlocked = gameStore.getState().playerData.unlockedChemDex;

        let x = -200,
            y = -100;

        if (unlocked.length === 0) {
            this.uiContainer.add(
                this.add
                    .text(
                        0,
                        0,
                        "No molecules discovered yet.\nGo synthesize some in the Lab!",
                        {
                            fontFamily: '"Inter"',
                            color: "#636e72",
                            align: "center",
                        },
                    )
                    .setOrigin(0.5),
            );
            return;
        }

        for (const symbol of unlocked) {
            // Find item data
            let itemData: ItemData | null = null;
            for (const key in items) {
                if (
                    items[key].symbol === symbol &&
                    items[key].type === "molecule"
                ) {
                    itemData = items[key];
                    break;
                }
            }
            if (!itemData) continue;

            const card = this.add
                .rectangle(x, y, 160, 100, 0x1a0e00, 0.85)
                .setStrokeStyle(1, 0xf39c12);
            const icon = this.add
                .text(x - 50, y - 10, itemData.symbol, {
                    fontFamily: '"Inter"',
                    fontSize: "24px",
                    fontStyle: "bold",
                    color: itemData.color,
                })
                .setOrigin(0.5);
            const name = this.add
                .text(x + 20, y - 20, itemData.name, {
                    fontFamily: '"Inter"',
                    fontSize: "12px",
                    color: "#fff",
                    fontStyle: "bold",
                    wordWrap: { width: 100 },
                })
                .setOrigin(0.5);

            const descStr = itemData.description || "A fascinating molecule.";
            const desc = this.add
                .text(x + 20, y + 10, descStr, {
                    fontFamily: '"Inter"',
                    fontSize: "9px",
                    color: "#dfe6e9",
                    wordWrap: { width: 90 },
                })
                .setOrigin(0.5);

            this.uiContainer.add([card, icon, name, desc]);

            x += 180;
            if (x > 200) {
                x = -200;
                y += 120;
            }
        }
    }

    private renderMap() {
        const gameScene = this.getActiveMapScene() as any;
        if (!gameScene || !gameScene.player || !gameScene.mapData) return;

        const mapData = gameScene.mapData as MapData;
        const mapW = mapData.width;
        const mapH = mapData.height;
        const tilePx = 20;
        const totalPxW = mapW * tilePx;
        const totalPxH = mapH * tilePx;

        const container = this.uiContainer;
        const g = this.add.graphics();
        container.add(g);

        const ts = mapData.tileSize;

        // Full-screen dark background for the map area
        g.fillStyle(0x0a0704, 0.92);
        g.fillRoundedRect(
            -totalPxW / 2 - 36,
            -totalPxH / 2 - 56,
            totalPxW + 72,
            totalPxH + 120,
            16,
        );
        g.lineStyle(2, 0xf39c12, 0.25);
        g.strokeRoundedRect(
            -totalPxW / 2 - 36,
            -totalPxH / 2 - 56,
            totalPxW + 72,
            totalPxH + 120,
            16,
        );

        // Map area origin (centered)
        const ox = -totalPxW / 2;
        const oy = -totalPxH / 2 + 10;

        // Terrain pass
        for (let y = 0; y < mapH; y++) {
            for (let x = 0; x < mapW; x++) {
                const val = mapData.ground[y][x];
                const rx = ox + x * tilePx;
                const ry = oy + y * tilePx;

                if (val === 1) {
                    g.fillStyle(0x2a1a0e, 0.85);
                    g.fillRect(rx, ry, tilePx, tilePx);
                } else if (val >= 2 && val <= 4) {
                    g.fillStyle(0x7a6a4a, 0.3);
                    g.fillRect(rx, ry, tilePx, tilePx);
                } else if (val === 5) {
                    g.fillStyle(0x4a7a3a, 0.4);
                    g.fillRect(rx, ry, tilePx, tilePx);
                } else if (val === 6) {
                    g.fillStyle(0x3a5a7a, 0.35);
                    g.fillRect(rx, ry, tilePx, tilePx);
                } else {
                    g.fillStyle(0x3a7a2a, 0.25);
                    g.fillRect(rx, ry, tilePx, tilePx);
                }

                // Subtle bevel for depth
                g.fillStyle(0x000000, 0.06);
                g.fillRect(rx + tilePx - 1, ry, 1, tilePx);
                g.fillRect(rx, ry + tilePx - 1, tilePx, 1);
            }
        }

        // Map frame border
        g.lineStyle(1.5, 0xf39c12, 0.45);
        g.strokeRect(ox, oy, totalPxW, totalPxH);

        // Title
        container.add(
            this.add
                .text(0, oy - 40, `🗺  ${mapData.name}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: "13px",
                    color: "#f39c12",
                })
                .setOrigin(0.5),
        );

        // Buildings
        const buildingColors: Record<string, number> = {
            lab: 0x8b4513,
            library: 0x3a6a35,
            shop: 0x6b4226,
        };
        for (const b of mapData.buildings) {
            const col = buildingColors[b.type] || 0x555555;
            const minX = Math.min(...b.tiles.map(([bx]) => bx));
            const maxX = Math.max(...b.tiles.map(([bx]) => bx));
            const minY = Math.min(...b.tiles.map(([, by]) => by));

            for (const [bx, by] of b.tiles) {
                g.fillStyle(col, 0.92);
                g.fillRect(ox + bx * tilePx, oy + by * tilePx, tilePx, tilePx);
            }

            // Roof highlight on top row
            for (const [bx, by] of b.tiles) {
                if (!b.tiles.some(([ax, ay]) => ax === bx && ay === by - 1)) {
                    g.fillStyle(0xffffff, 0.1);
                    g.fillRect(
                        ox + bx * tilePx + 1,
                        oy + by * tilePx + 1,
                        tilePx - 2,
                        3,
                    );
                }
            }

            g.lineStyle(1, 0x000000, 0.35);
            for (const [bx, by] of b.tiles) {
                g.strokeRect(
                    ox + bx * tilePx,
                    oy + by * tilePx,
                    tilePx,
                    tilePx,
                );
            }

            const bw = (maxX - minX + 1) * tilePx;
            const label = this.add
                .text(
                    ox + minX * tilePx + bw / 2,
                    oy + minY * tilePx - 4,
                    b.name,
                    {
                        fontFamily: '"Inter"',
                        fontSize: "9px",
                        color: "#fff",
                        backgroundColor: "#000000aa",
                        padding: { x: 4, y: 2 },
                    },
                )
                .setOrigin(0.5, 1);
            container.add(label);
        }

        // Portals as glowing gateways
        if (mapData.portals) {
            for (const portal of mapData.portals) {
                const cx = ox + portal.tileX * tilePx + tilePx / 2;
                const cy = oy + portal.tileY * tilePx + tilePx / 2;
                g.fillStyle(0xf39c12, 0.15);
                g.fillCircle(cx, cy, 12);
                g.lineStyle(2, 0xf39c12, 0.8);
                g.strokeCircle(cx, cy, 6);
                g.fillStyle(0xffeaa7, 0.9);
                g.fillCircle(cx, cy, 2.5);
            }
        }

        const gs = gameScene.player;
        const px = Math.floor(gs.x / ts);
        const py = Math.floor(gs.y / ts);
        g.fillStyle(0x00b894, 1);
        g.fillCircle(
            ox + px * tilePx + tilePx / 2,
            oy + py * tilePx + tilePx / 2,
            4,
        );
        // Decorations
        if (mapData.decorations) {
            for (const dec of mapData.decorations) {
                const dx = ox + dec.tileX * tilePx + tilePx / 2;
                const dy = oy + dec.tileY * tilePx + tilePx / 2;
                if (dec.type === "tree") {
                    g.fillStyle(0x2d6d2d, 0.7);
                    g.fillCircle(dx, dy - 1, 3);
                    g.fillStyle(0x5c3a1e, 0.7);
                    g.fillRect(dx - 1, dy + 1, 2, 3);
                } else {
                    g.fillStyle(0x888888, 0.35);
                    g.fillCircle(dx, dy, 1.5);
                }
            }
        }

        // NPC dots
        if (mapData.npcs) {
            for (const npc of mapData.npcs) {
                g.fillStyle(0xffffff, 0.3);
                g.fillCircle(
                    ox + npc.tileX * tilePx + tilePx / 2,
                    oy + npc.tileY * tilePx + tilePx / 2,
                    1.5,
                );
            }
        }

        // Player marker
        const ppx = Math.floor(gameScene.player.x / ts);
        const ppy = Math.floor(gameScene.player.y / ts);
        const pcx = ox + ppx * tilePx + tilePx / 2;
        const pcy = oy + ppy * tilePx + tilePx / 2;
        g.fillStyle(0x00b894, 0.12);
        g.fillCircle(pcx, pcy, 14);
        g.lineStyle(2, 0x00b894, 0.5);
        g.strokeCircle(pcx, pcy, 8);
        g.fillStyle(0x00b894, 1);
        g.fillCircle(pcx, pcy, 4);
        g.lineStyle(1.5, 0xffffff, 0.9);
        g.strokeCircle(pcx, pcy, 4);

        // Legend
        const legendY = oy + totalPxH + 16;
        const legParts = [
            { text: "▨ Wall", color: "#5a3a2a" },
            { text: "▨ Building", color: "#8B4513" },
            { text: "◉ Portal", color: "#f39c12" },
            { text: "● You", color: "#00b894" },
        ];
        let legX = -totalPxW / 2;
        for (const part of legParts) {
            const txt = this.add
                .text(legX, legendY, part.text, {
                    fontFamily: '"Inter"',
                    fontSize: "9px",
                    color: part.color,
                })
                .setOrigin(0, 0.5);
            container.add(txt);
            legX += txt.width + 18;
        }

        // Compass
        const compX = ox + totalPxW - 14;
        const compY = oy + 14;
        g.lineStyle(1, 0xf39c12, 0.4);
        g.lineBetween(compX, compY + 4, compX, compY - 8);
        g.fillStyle(0xf39c12, 0.7);
        g.fillTriangle(
            compX,
            compY - 10,
            compX + 4,
            compY - 4,
            compX - 4,
            compY - 4,
        );
        container.add(
            this.add
                .text(compX, compY - 15, "N", {
                    fontFamily: '"Inter"',
                    fontSize: "9px",
                    color: "#f39c12",
                    fontStyle: "bold",
                })
                .setOrigin(0.5),
        );

        // Close hint
        container.add(
            this.add
                .text(0, legendY + 18, "Press ESC to close", {
                    fontFamily: '"Inter"',
                    fontSize: "9px",
                    color: "#4a3a2a",
                })
                .setOrigin(0.5),
        );
    }

    private showNotification(data: {
        title: string;
        message: string;
        icon: string;
    }) {
        const { width } = this.cameras.main;
        const c = this.add.container(width / 2, -50);

        const bg = this.add
            .rectangle(0, 0, 300, 60, 0x1a0e00, 0.9)
            .setStrokeStyle(2, 0xf39c12)
            .setOrigin(0.5);
        const icon = this.add
            .text(-120, 0, data.icon, { fontSize: "24px" })
            .setOrigin(0.5);
        const title = this.add.text(-80, -15, data.title, {
            fontFamily: '"Inter"',
            fontSize: "12px",
            color: "#f39c12",
            fontStyle: "bold",
        });
        const msg = this.add.text(-80, 5, data.message, {
            fontFamily: '"Inter"',
            fontSize: "12px",
            color: "#dfe6e9",
        });

        c.add([bg, icon, title, msg]);

        this.tweens.add({
            targets: c,
            y: 50,
            duration: 400,
            ease: "Back.easeOut",
        });
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: c,
                y: -50,
                duration: 300,
                ease: "Power2",
                onComplete: () => c.destroy(),
            });
        });
    }
}
