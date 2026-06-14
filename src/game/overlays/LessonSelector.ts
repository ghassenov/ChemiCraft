import Phaser from "phaser";
import { gameStore } from "../../store/gameStore";

interface Lesson {
    id: string;
    title: string;
    desc: string;
    reward: number;
}

interface Question {
    q: string;
    opts: string[];
    ans: number;
}

interface MapLessonSet {
    lessons: Lesson[];
    quizzes: Record<string, Question[]>;
    completionItem: string | null;
}

const mapLessonSets: Record<string, MapLessonSet> = {
    atomMeadows: {
        lessons: [
            {
                id: "atoms",
                title: "What is an Atom?",
                desc: "Learn the basics of matter.",
                reward: 10,
            },
            {
                id: "molecules",
                title: "Building Molecules",
                desc: "How atoms join together.",
                reward: 15,
            },
            {
                id: "covalent",
                title: "Covalent Bonds",
                desc: "Sharing electrons.",
                reward: 20,
            },
            {
                id: "reactions",
                title: "Chemical Reactions",
                desc: "Transforming matter.",
                reward: 25,
            },
            {
                id: "states",
                title: "States of Matter",
                desc: "Solid, liquid, gas, and plasma.",
                reward: 15,
            },
            {
                id: "periodic",
                title: "Periodic Table",
                desc: "Organizing the elements.",
                reward: 20,
            },
        ],
        quizzes: {
            atoms: [
                {
                    q: "What is an atom?",
                    opts: [
                        "A type of bond",
                        "A basic building block of matter",
                        "A chemical reaction",
                    ],
                    ans: 1,
                },
                {
                    q: "What particle orbits the nucleus?",
                    opts: ["Proton", "Neutron", "Electron"],
                    ans: 2,
                },
                {
                    q: "What charge do protons have?",
                    opts: ["Negative", "Neutral", "Positive"],
                    ans: 2,
                },
                {
                    q: "What is the atomic number of an element?",
                    opts: [
                        "Number of neutrons",
                        "Number of protons",
                        "Number of electrons in outer shell",
                    ],
                    ans: 1,
                },
                {
                    q: "Which subatomic particle has no charge?",
                    opts: ["Proton", "Neutron", "Electron"],
                    ans: 1,
                },
            ],
            molecules: [
                {
                    q: "What is a molecule?",
                    opts: [
                        "A group of atoms bonded together",
                        "A single electron",
                        "A type of gas",
                    ],
                    ans: 0,
                },
                {
                    q: "What is the chemical formula for water?",
                    opts: ["HO₂", "H₂O", "H₂O₂"],
                    ans: 1,
                },
                {
                    q: "How many atoms are in a water molecule?",
                    opts: ["2", "3", "4"],
                    ans: 1,
                },
                {
                    q: "What does the subscript number in CO₂ mean?",
                    opts: [
                        "Number of molecules",
                        "Number of atoms of that element",
                        "Charge of the atom",
                    ],
                    ans: 1,
                },
                {
                    q: "Which of these is a diatomic molecule?",
                    opts: ["CO₂", "O₂", "H₂O"],
                    ans: 1,
                },
            ],
            covalent: [
                {
                    q: "What happens in a covalent bond?",
                    opts: [
                        "Atoms explode",
                        "Atoms steal protons",
                        "Atoms share electrons",
                    ],
                    ans: 2,
                },
                {
                    q: "How many covalent bonds does N₂ have?",
                    opts: ["1 (single)", "2 (double)", "3 (triple)"],
                    ans: 2,
                },
                {
                    q: "Which bond is the strongest?",
                    opts: ["Single bond", "Double bond", "Triple bond"],
                    ans: 2,
                },
                {
                    q: "What type of bond joins hydrogen and oxygen in water?",
                    opts: ["Ionic bond", "Covalent bond", "Metallic bond"],
                    ans: 1,
                },
                {
                    q: "Electrons in a covalent bond are...",
                    opts: [
                        "Transferred between atoms",
                        "Shared between atoms",
                        "Destroyed in the reaction",
                    ],
                    ans: 1,
                },
            ],
            reactions: [
                {
                    q: "What is the starting material in a reaction called?",
                    opts: ["Reactant", "Product", "Catalyst"],
                    ans: 0,
                },
                {
                    q: "What is a catalyst?",
                    opts: [
                        "A reaction product",
                        "A substance that speeds up a reaction",
                        "A type of molecule",
                    ],
                    ans: 1,
                },
                {
                    q: "In a chemical reaction, atoms are...",
                    opts: [
                        "Created from energy",
                        "Destroyed into energy",
                        "Rearranged into new molecules",
                    ],
                    ans: 2,
                },
                {
                    q: "What happens in an exothermic reaction?",
                    opts: [
                        "Heat is absorbed",
                        "Heat is released",
                        "No heat change",
                    ],
                    ans: 1,
                },
                {
                    q: "What does it mean to balance a chemical equation?",
                    opts: [
                        "Equal reactants and products mass",
                        "Same number of each atom on both sides",
                        "Equal temperature on both sides",
                    ],
                    ans: 1,
                },
            ],
            states: [
                {
                    q: "Which state of matter has a fixed shape and volume?",
                    opts: ["Solid", "Liquid", "Gas"],
                    ans: 0,
                },
                {
                    q: "What happens to molecules when a solid melts?",
                    opts: [
                        "They stop moving",
                        "They vibrate faster and break free",
                        "They disappear",
                    ],
                    ans: 1,
                },
                {
                    q: "Which state of matter has the most energy?",
                    opts: ["Solid", "Liquid", "Gas"],
                    ans: 2,
                },
                {
                    q: "What is condensation?",
                    opts: ["Solid to gas", "Gas to liquid", "Liquid to solid"],
                    ans: 1,
                },
                {
                    q: "What is the fourth state of matter?",
                    opts: ["Plasma", "Crystal", "Gel"],
                    ans: 0,
                },
            ],
            periodic: [
                {
                    q: "Who created the periodic table?",
                    opts: ["Einstein", "Mendeleev", "Newton"],
                    ans: 1,
                },
                {
                    q: "Elements in the same column have the same number of...",
                    opts: ["Neutrons", "Valence electrons", "Protons"],
                    ans: 1,
                },
                {
                    q: "What are elements in the same row called?",
                    opts: ["Group", "Period", "Block"],
                    ans: 1,
                },
                {
                    q: "Where are metals on the periodic table?",
                    opts: ["Right side", "Left side", "Diagonally across"],
                    ans: 1,
                },
                {
                    q: "What is the lightest element?",
                    opts: ["Helium", "Hydrogen", "Lithium"],
                    ans: 1,
                },
            ],
        },
        completionItem: null,
    },

    recyclingFields: {
        lessons: [
            {
                id: "plastic_id",
                title: "Plastic Identification",
                desc: "PET, HDPE, PVC, and more.",
                reward: 15,
            },
            {
                id: "glass_metal",
                title: "Glass & Metal Types",
                desc: "Learn how to sort them.",
                reward: 15,
            },
            {
                id: "paper_organic",
                title: "Paper & Organic Waste",
                desc: "Composting and recycling paper.",
                reward: 15,
            },
            {
                id: "circular_eco",
                title: "The Circular Economy",
                desc: "Waste as a resource.",
                reward: 20,
            },
        ],
        quizzes: {
            plastic_id: [
                {
                    q: "What does PET stand for?",
                    opts: [
                        "Polyethylene Terephthalate",
                        "Petroleum Ethyl Toluene",
                        "Plastic Enhanced Thermoplastic",
                    ],
                    ans: 0,
                },
                {
                    q: "Which plastic is used for water bottles?",
                    opts: ["HDPE", "PET", "PVC"],
                    ans: 1,
                },
                {
                    q: "What color is HDPE plastic typically?",
                    opts: ["Clear", "Milky white", "Black"],
                    ans: 1,
                },
                {
                    q: "How long does plastic take to decompose?",
                    opts: ["100 years", "10 years", "Up to 1000 years"],
                    ans: 2,
                },
                {
                    q: "Which resin code is for Polypropylene?",
                    opts: ["2", "5", "7"],
                    ans: 1,
                },
            ],
            glass_metal: [
                {
                    q: "Is glass 100% recyclable?",
                    opts: ["Yes", "No", "Only clear glass"],
                    ans: 0,
                },
                {
                    q: "What metal is most commonly recycled?",
                    opts: ["Gold", "Aluminum", "Copper"],
                    ans: 1,
                },
                {
                    q: "Does recycling aluminum save energy?",
                    opts: [
                        "No, it uses more",
                        "Yes, up to 95% savings",
                        "It breaks even",
                    ],
                    ans: 1,
                },
                {
                    q: "What contaminates glass recycling?",
                    opts: ["Labels", "Ceramics and Pyrex", "Metal caps"],
                    ans: 1,
                },
                {
                    q: "How many times can glass be recycled?",
                    opts: ["Once", "3 times", "Infinitely"],
                    ans: 2,
                },
            ],
            paper_organic: [
                {
                    q: "What type of paper cannot be recycled?",
                    opts: ["Newspaper", "Wax-coated paper", "Cardboard"],
                    ans: 1,
                },
                {
                    q: "What does composting require?",
                    opts: [
                        "Only green waste",
                        "Oxygen, moisture, and microbes",
                        "Plastic containers",
                    ],
                    ans: 1,
                },
                {
                    q: "How long does paper take to decompose?",
                    opts: ["2-6 weeks", "2 years", "50 years"],
                    ans: 0,
                },
                {
                    q: "What is NOT compostable?",
                    opts: ["Fruit scraps", "Meat and dairy", "Leaves"],
                    ans: 1,
                },
                {
                    q: "What color bin is for paper in standard systems?",
                    opts: ["Green", "Blue", "Yellow"],
                    ans: 1,
                },
            ],
            circular_eco: [
                {
                    q: "What is a circular economy?",
                    opts: [
                        "Burning waste for energy",
                        "Keeping materials in use as long as possible",
                        "Making products with recycled content only",
                    ],
                    ans: 1,
                },
                {
                    q: "Which country recycles the most?",
                    opts: ["USA", "Germany", "Japan"],
                    ans: 1,
                },
                {
                    q: "What is an eco brick?",
                    opts: [
                        "A brick made from compressed plastic waste",
                        "A very expensive brick",
                        "A type of clay brick",
                    ],
                    ans: 0,
                },
                {
                    q: "What is downcycling?",
                    opts: [
                        "Recycling into a lower-value product",
                        "Recycling into the same product",
                        "Throwing away recyclables",
                    ],
                    ans: 0,
                },
                {
                    q: "What percentage of plastic has been recycled globally?",
                    opts: ["9%", "30%", "50%"],
                    ans: 0,
                },
            ],
        },
        completionItem: "materials_certificate",
    },

    ecoVille: {
        lessons: [
            {
                id: "climate_basics",
                title: "Climate Science Basics",
                desc: "Greenhouse effect and global warming.",
                reward: 15,
            },
            {
                id: "carbon_cycle",
                title: "The Carbon Cycle",
                desc: "How carbon moves through Earth.",
                reward: 15,
            },
            {
                id: "carbon_capture",
                title: "Carbon Capture Tech",
                desc: "Removing CO₂ from the air.",
                reward: 20,
            },
            {
                id: "renewable_energy",
                title: "Renewable Energy",
                desc: "Solar, biofuel, wind, and more.",
                reward: 20,
            },
            {
                id: "sustainable_city",
                title: "Sustainable Cities",
                desc: "Building a carbon-neutral future.",
                reward: 25,
            },
        ],
        quizzes: {
            climate_basics: [
                {
                    q: "Which gas is the primary greenhouse gas from human activity?",
                    opts: ["Oxygen", "Carbon Dioxide", "Nitrogen"],
                    ans: 1,
                },
                {
                    q: "What does the greenhouse effect do?",
                    opts: [
                        "Cools the planet",
                        "Traps heat in the atmosphere",
                        "Blocks all sunlight",
                    ],
                    ans: 1,
                },
                {
                    q: "Which is a stronger greenhouse gas, molecule for molecule?",
                    opts: ["CO₂", "CH₄ (Methane)", "O₂"],
                    ans: 1,
                },
                {
                    q: "What human activity produces the most greenhouse gases?",
                    opts: [
                        "Burning fossil fuels",
                        "Growing food",
                        "Using phones",
                    ],
                    ans: 0,
                },
                {
                    q: "What percentage of Earth's atmosphere is CO₂?",
                    opts: ["About 0.04%", "About 4%", "About 21%"],
                    ans: 0,
                },
            ],
            carbon_cycle: [
                {
                    q: "Where is most of Earth's carbon stored?",
                    opts: [
                        "In the atmosphere",
                        "In the oceans and rocks",
                        "In living things",
                    ],
                    ans: 1,
                },
                {
                    q: "What process removes CO₂ from the atmosphere?",
                    opts: ["Respiration", "Photosynthesis", "Combustion"],
                    ans: 1,
                },
                {
                    q: "What happens when oceans absorb more CO₂?",
                    opts: [
                        "They become more alkaline",
                        "They become more acidic",
                        "Nothing changes",
                    ],
                    ans: 1,
                },
                {
                    q: "How does deforestation affect the carbon cycle?",
                    opts: [
                        "Increases CO₂ in the atmosphere",
                        "Decreases CO₂",
                        "No effect",
                    ],
                    ans: 0,
                },
                {
                    q: "What is the Keeling Curve?",
                    opts: [
                        "A graph of rising CO₂ levels",
                        "A type of solar panel",
                        "A weather pattern",
                    ],
                    ans: 0,
                },
            ],
            carbon_capture: [
                {
                    q: "What is carbon capture?",
                    opts: [
                        "Trapping CO₂ before it reaches the atmosphere",
                        "Growing more plants",
                        "Using less energy",
                    ],
                    ans: 0,
                },
                {
                    q: "What material is commonly used to filter pollutants?",
                    opts: ["Plastic", "Activated carbon", "Aluminum"],
                    ans: 1,
                },
                {
                    q: "What happens to captured CO₂ in this game?",
                    opts: [
                        "Released into space",
                        "Converted into carbon credits",
                        "Stored underground forever",
                    ],
                    ans: 1,
                },
                {
                    q: "In the game, what do you combine to capture CO₂?",
                    opts: [
                        "O₂ + H₂",
                        "Pollution sample + clean water",
                        "C + H + H + H + H",
                    ],
                    ans: 1,
                },
                {
                    q: "How many captured CO₂ units make a carbon credit?",
                    opts: ["1", "2", "3"],
                    ans: 1,
                },
            ],
            renewable_energy: [
                {
                    q: "Which energy source is considered renewable?",
                    opts: ["Coal", "Natural gas", "Solar"],
                    ans: 2,
                },
                {
                    q: "What do solar panels convert sunlight into?",
                    opts: ["Heat", "Electricity", "Fuel"],
                    ans: 1,
                },
                {
                    q: "Why is biofuel considered carbon-neutral?",
                    opts: [
                        "It produces no CO₂",
                        "Plants absorbed CO₂ while growing",
                        "It uses no energy to make",
                    ],
                    ans: 1,
                },
                {
                    q: "What materials make a solar panel in the game?",
                    opts: [
                        "Plastic + metal",
                        "Recycled plastic + recycled glass",
                        "Wood + water",
                    ],
                    ans: 1,
                },
                {
                    q: "Which renewable source provides the most energy worldwide?",
                    opts: ["Solar", "Wind", "Hydropower"],
                    ans: 2,
                },
            ],
            sustainable_city: [
                {
                    q: "What does carbon neutral mean?",
                    opts: [
                        "Zero CO₂ produced",
                        "CO₂ emitted equals CO₂ removed",
                        "Only using renewable energy",
                    ],
                    ans: 1,
                },
                {
                    q: "What is the final quest reward in EcoVille?",
                    opts: ["Biofuel", "Solar panel", "Green Certificate"],
                    ans: 2,
                },
                {
                    q: "What three items make the Green Certificate?",
                    opts: [
                        "Biofuel + solar + carbon credit",
                        "Water + air + soil",
                        "Plastic + glass + metal",
                    ],
                    ans: 0,
                },
                {
                    q: "Where do recycled plastic and glass come from?",
                    opts: [
                        "EcoVille shops",
                        "Recycling Fields",
                        "Atom Meadows",
                    ],
                    ans: 1,
                },
                {
                    q: "What unlocks after completing all EcoVille quests?",
                    opts: [
                        "Portal to Prism Heights",
                        "Portal back to Atom Meadows",
                        "The Green Certificate",
                    ],
                    ans: 0,
                },
            ],
        },
        completionItem: null,
    },

    prismHeights: {
        lessons: [
            {
                id: "light_basics",
                title: "The Nature of Light",
                desc: "Wave-particle duality and the EM spectrum.",
                reward: 15,
            },
            {
                id: "refraction",
                title: "Refraction & Prisms",
                desc: "Snell's law, dispersion, and rainbows.",
                reward: 15,
            },
            {
                id: "lenses",
                title: "Lenses & Focusing",
                desc: "Convex/concave, focal point, telescopes.",
                reward: 20,
            },
            {
                id: "color_theory",
                title: "Color & the Spectrum",
                desc: "Additive vs subtractive, RGB, complementary.",
                reward: 20,
            },
            {
                id: "optics_tech",
                title: "Optics in Technology",
                desc: "Microscopes, fiber optics, lasers, cameras.",
                reward: 25,
            },
        ],
        quizzes: {
            light_basics: [
                {
                    q: "What is light?",
                    opts: [
                        "A particle only",
                        "A wave only",
                        "Both a wave and a particle",
                    ],
                    ans: 2,
                },
                {
                    q: "What is the speed of light in a vacuum?",
                    opts: ["300,000 km/s", "150,000 km/s", "3,000 km/s"],
                    ans: 0,
                },
                {
                    q: "Which color has the longest wavelength?",
                    opts: ["Blue", "Red", "Green"],
                    ans: 1,
                },
                {
                    q: "What part of the EM spectrum is visible?",
                    opts: ["380nm - 740nm", "100nm - 400nm", "700nm - 1mm"],
                    ans: 0,
                },
                {
                    q: "What did Newton call the seven colors of light?",
                    opts: [
                        "The Spectrum",
                        "The Rainbow",
                        "The Prismatic Colors",
                    ],
                    ans: 0,
                },
            ],
            refraction: [
                {
                    q: "What happens when light enters a prism?",
                    opts: [
                        "It reflects",
                        "It bends (refracts)",
                        "It stops moving",
                    ],
                    ans: 1,
                },
                {
                    q: "Why does a prism split white light?",
                    opts: [
                        "Different colors travel at different speeds",
                        "The prism has filters inside",
                        "Light gets hotter inside the prism",
                    ],
                    ans: 0,
                },
                {
                    q: "What is Snell's Law about?",
                    opts: [
                        "Light reflection",
                        "Light refraction at boundaries",
                        "Light absorption",
                    ],
                    ans: 1,
                },
                {
                    q: "Which color bends the most through a prism?",
                    opts: ["Red", "Green", "Violet"],
                    ans: 2,
                },
                {
                    q: "What creates a rainbow in nature?",
                    opts: [
                        "Raindrops refracting sunlight",
                        "Clouds reflecting moonlight",
                        "Wind scattering light",
                    ],
                    ans: 0,
                },
            ],
            lenses: [
                {
                    q: "What does a convex lens do to parallel light?",
                    opts: [
                        "Spreads it out",
                        "Focuses it to a point",
                        "Blocks it completely",
                    ],
                    ans: 1,
                },
                {
                    q: "What is the focal point?",
                    opts: [
                        "Where light rays converge",
                        "The center of the lens",
                        "The edge of the lens",
                    ],
                    ans: 0,
                },
                {
                    q: "What shape is a concave lens?",
                    opts: [
                        "Thicker in the middle",
                        "Thinner in the middle",
                        "Flat on both sides",
                    ],
                    ans: 1,
                },
                {
                    q: "Which device uses a convex lens?",
                    opts: ["Mirror", "Telescope", "Window"],
                    ans: 1,
                },
                {
                    q: "What happens when you combine two convex lenses?",
                    opts: [
                        "They cancel out",
                        "They create a telescope or microscope",
                        "They block all light",
                    ],
                    ans: 1,
                },
            ],
            color_theory: [
                {
                    q: "What are the primary additive colors?",
                    opts: [
                        "Red, yellow, blue",
                        "Red, green, blue",
                        "Cyan, magenta, yellow",
                    ],
                    ans: 1,
                },
                {
                    q: "What do you get mixing red and green light?",
                    opts: ["Yellow", "Brown", "White"],
                    ans: 0,
                },
                {
                    q: "What is additive color mixing?",
                    opts: [
                        "Mixing paints",
                        "Mixing colored lights",
                        "Mixing filters",
                    ],
                    ans: 1,
                },
                {
                    q: "What color is created by all RGB light combined?",
                    opts: ["Black", "White", "Gray"],
                    ans: 1,
                },
                {
                    q: "How do screens create all colors?",
                    opts: [
                        "Using RGB pixels",
                        "Using CMYK ink",
                        "Using colored glass",
                    ],
                    ans: 0,
                },
            ],
            optics_tech: [
                {
                    q: "What does a microscope use to magnify?",
                    opts: ["Prisms", "Multiple lenses", "Mirrors only"],
                    ans: 1,
                },
                {
                    q: "How does fiber optics transmit data?",
                    opts: [
                        "Using electricity",
                        "Using total internal reflection of light",
                        "Using radio waves",
                    ],
                    ans: 1,
                },
                {
                    q: "What does LASER stand for?",
                    opts: [
                        "Light amplification by stimulated emission of radiation",
                        "Light and sound energy ray",
                        "Large aperture spectrum emitter ray",
                    ],
                    ans: 0,
                },
                {
                    q: "What part of a camera focuses light?",
                    opts: ["The sensor", "The lens", "The shutter"],
                    ans: 1,
                },
                {
                    q: "What technology uses optics to read data?",
                    opts: ["Hard drives", "CD/DVD drives", "USB drives"],
                    ans: 1,
                },
            ],
        },
        completionItem: null,
    },
};

export function openLessonSelector(scene: Phaser.Scene, mapKey?: string) {
    const effectiveMapKey = mapKey || gameStore.getCurrentMap();
    const set = mapLessonSets[effectiveMapKey] || mapLessonSets["atomMeadows"];
    const { width, height } = scene.cameras.main;
    const cx = width * 0.5 - 120;
    const overlay = scene.add
        .rectangle(0, 0, width, height, 0x000, 0.8)
        .setOrigin(0)
        .setDepth(50);

    const panel = scene.add.graphics().setDepth(51);
    panel.fillStyle(0x1a1510, 0.95);
    panel.fillRoundedRect(cx - 200, height / 2 - 160, 400, 320, 12);
    panel.lineStyle(2, 0x3498db, 0.5);
    panel.strokeRoundedRect(cx - 200, height / 2 - 160, 400, 320, 12);

    const titleText =
        effectiveMapKey === "recyclingFields"
            ? "MATERIALS STUDY CENTER"
            : effectiveMapKey === "ecoVille"
              ? "ECO CLIMATE LIBRARY"
              : effectiveMapKey === "prismHeights"
                ? "OPTICS STUDY CENTER"
                : "SELECT A LESSON";
    const title = scene.add
        .text(cx, height / 2 - 130, titleText, {
            fontFamily: '"Press Start 2P"',
            fontSize: "12px",
            color: "#d4a855",
        })
        .setOrigin(0.5)
        .setDepth(52);

    const closeIcn = scene.add
        .text(cx + 180, height / 2 - 150, "✕", {
            fontFamily: '"Inter"',
            fontSize: "16px",
            color: "#ff7675",
        })
        .setOrigin(0.5)
        .setDepth(55)
        .setInteractive({ useHandCursor: true });

    const closeBtn = scene.add
        .text(cx, height / 2 + 145, "Close", {
            fontFamily: '"Inter"',
            fontSize: "12px",
            color: "#636e72",
        })
        .setOrigin(0.5)
        .setDepth(53)
        .setInteractive({ useHandCursor: true });

    const items: Phaser.GameObjects.GameObject[] = [
        overlay,
        panel,
        title,
        closeIcn,
        closeBtn,
    ];

    // Scrollable lesson list
    const scrollAreaTop = height / 2 - 95;
    const scrollAreaBottom = height / 2 + 130;
    const scrollAreaHeight = scrollAreaBottom - scrollAreaTop;

    const maskGfx = scene.add.graphics().setDepth(51).setVisible(false);
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(cx - 170, scrollAreaTop, 340, scrollAreaHeight);
    const mask = maskGfx.createGeometryMask();

    const listContainer = scene.add.container(0, 0).setDepth(52);
    listContainer.setMask(mask);

    const rowPitch = 54;
    const rowHeight = 46;
    let y = scrollAreaTop;
    for (const lesson of set.lessons) {
        const rowG = scene.add.graphics();
        rowG.fillStyle(0x2a1e17, 0.85);
        rowG.fillRoundedRect(cx - 170, y, 340, rowHeight, 6);
        rowG.lineStyle(1, 0x3498db, 0.3);
        rowG.strokeRoundedRect(cx - 170, y, 340, rowHeight, 6);

        const lt = scene.add.text(cx - 150, y + 6, lesson.title, {
            fontFamily: '"Inter"',
            fontSize: "14px",
            color: "#f1c40f",
            fontStyle: "bold",
        });

        const ld = scene.add.text(cx - 150, y + 26, lesson.desc, {
            fontFamily: '"Inter"',
            fontSize: "11px",
            color: "#8a7a6a",
        });

        const btnBg = scene.add.graphics();
        btnBg.fillStyle(0x00b894, 0.85);
        btnBg.fillRoundedRect(cx + 70, y + 6, 80, 26, 6);

        const btnT = scene.add
            .text(cx + 110, y + 19, "OPEN", {
                fontFamily: '"Inter"',
                fontSize: "11px",
                color: "#fff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        const zone = scene.add
            .zone(cx + 110, y + 19, 80, 26)
            .setInteractive({ useHandCursor: true });
        zone.on("pointerdown", () => {
            destroyAll();
            openLessonContent(
                scene,
                lesson,
                [...(set.quizzes[lesson.id] || [])],
                effectiveMapKey,
                set.completionItem,
            );
        });
        zone.on("pointerover", () => {
            btnBg.clear();
            btnBg.fillStyle(0x00e8a4, 0.9);
            btnBg.fillRoundedRect(cx + 70, y + 6, 80, 26, 6);
        });
        zone.on("pointerout", () => {
            btnBg.clear();
            btnBg.fillStyle(0x00b894, 0.85);
            btnBg.fillRoundedRect(cx + 70, y + 6, 80, 26, 6);
        });

        items.push(rowG, lt, ld, btnBg, btnT, zone);
        listContainer.add([rowG, lt, ld, btnBg, btnT, zone]);
        y += rowPitch;
    }

    items.push(listContainer);
    items.push(maskGfx);

    const firstY = scrollAreaTop;
    const lastY = firstY + (set.lessons.length - 1) * rowPitch;
    const lastBottom = lastY + rowHeight;
    const contentHeight = lastBottom - firstY;
    const maxScroll = Math.max(0, contentHeight - scrollAreaHeight);
    let scrollOffset = 0;

    const wheelHandler = (
        pointer: Phaser.Input.Pointer,
        _gameObjects: any[],
        _deltaX: number,
        deltaY: number,
    ) => {
        if (
            pointer.x >= cx - 170 &&
            pointer.x <= cx + 170 &&
            pointer.y >= scrollAreaTop &&
            pointer.y <= scrollAreaBottom
        ) {
            scrollOffset = Phaser.Math.Clamp(
                scrollOffset + deltaY,
                0,
                maxScroll,
            );
            listContainer.y = -scrollOffset;
        }
    };

    if (maxScroll > 0) {
        scene.input.on("wheel", wheelHandler);
    }

    const destroyAll = () => {
        scene.input.off("wheel", wheelHandler);
        items.forEach((i) => i.destroy());
    };

    closeIcn.on("pointerdown", destroyAll);
    closeBtn.on("pointerdown", destroyAll);
}

function openLessonContent(
    scene: Phaser.Scene,
    lesson: Lesson,
    remaining: Question[],
    mapKey: string,
    completionItem: string | null,
) {
    const { width, height } = scene.cameras.main;
    const cx = width * 0.5 - 120;

    let content = "";
    if (lesson.id === "atoms")
        content =
            "Atoms are the basic building blocks of all matter. They consist of a nucleus containing protons and neutrons, surrounded by electrons. Different types of atoms are called elements (like Hydrogen, Oxygen, Carbon).";
    else if (lesson.id === "molecules")
        content =
            "A molecule is a group of two or more atoms held together by chemical bonds. For example, O\u2082 is a molecule made of two oxygen atoms.";
    else if (lesson.id === "covalent")
        content =
            "Covalent bonds form when atoms share electrons to become stable. This is how non-metals typically bond together, like the Hydrogen and Oxygen in Water (H\u2082O).";
    else if (lesson.id === "reactions")
        content =
            "Chemical reactions involve breaking and making bonds to form new substances. The atoms you start with (reactants) are simply rearranged to form new molecules (products).";
    else if (lesson.id === "states")
        content =
            "Matter exists in four states: solid (fixed shape), liquid (flows), gas (expands to fill space), and plasma (ionized gas at extreme temperatures).";
    else if (lesson.id === "periodic")
        content =
            "The periodic table organizes all known elements by atomic number. Elements in the same column (group) have similar chemical properties because they have the same number of valence electrons.";
    else if (lesson.id === "plastic_id")
        content =
            "Plastics are identified by resin codes 1-7. PET (#1) is used for water bottles. HDPE (#2) is stiffer (milk jugs). PVC (#3) is used in pipes. LDPE (#4) is bags. PP (#5) is containers. PS (#6) is foam. Other (#7) is mixed. Each melts at a different temperature and requires separate processing.";
    else if (lesson.id === "glass_metal")
        content =
            "Glass is made from silica sand, soda ash, and limestone. It's infinitely recyclable without quality loss. Metals like aluminum are the most energy-efficient to recycle — aluminum recycling uses 95% less energy than primary production! Steel, copper, and brass are also valuable recyclables.";
    else if (lesson.id === "paper_organic")
        content =
            "Paper fibers weaken each time they're recycled, so paper can typically be recycled 5-7 times. Composting turns organic waste into nutrient-rich soil through thermophilic microbial activity. The right balance of greens (nitrogen), browns (carbon), air, and moisture is key to successful composting.";
    else if (lesson.id === "circular_eco")
        content =
            "A circular economy keeps resources in use for as long as possible, extracting maximum value, then recovering and regenerating products at end of life. This contrasts with the traditional linear economy (take-make-dispose). Eco bricks, upcycling, and industrial symbiosis are circular economy innovations.";
    else if (lesson.id === "climate_basics")
        content =
            "The greenhouse effect is a natural process where gases like CO\u2082 and CH\u2084 trap heat in Earth\u2019s atmosphere. Without it, our planet would be frozen. However, human activities \u2014 especially burning fossil fuels \u2014 have increased CO\u2082 levels by 50% since the Industrial Revolution, causing global temperatures to rise. This is climate change. The main greenhouse gases are CO\u2082 (carbon dioxide), CH\u2084 (methane), N\u2082O (nitrous oxide), and fluorinated gases.";
    else if (lesson.id === "carbon_cycle")
        content =
            "Carbon moves continuously through Earth\u2019s systems \u2014 the atmosphere, oceans, soil, and living things. Plants absorb CO\u2082 through photosynthesis, animals release it through respiration, and the oceans absorb vast amounts. The Keeling Curve, started by Charles David Keeling in 1958, shows atmospheric CO\u2082 rising from 315 ppm to over 420 ppm today. Deforestation and fossil fuel burning have disrupted this natural cycle, releasing carbon that was locked underground for millions of years.";
    else if (lesson.id === "carbon_capture")
        content =
            "Carbon capture technology traps CO\u2082 before it reaches the atmosphere. In this game, you combine a pollution sample (\u2601\uFE0F) with clean water (\uD83D\uDCA7) to capture CO\u2082 (\uD83E\uDEEB). Two captured CO\u2082 units can be combined into a carbon credit (\uD83C\uDF0D), which represents removing 1 tonne of CO\u2082 from the atmosphere. Real-world methods include chemical absorption, direct air capture, and bioenergy with carbon capture and storage (BECCS).";
    else if (lesson.id === "renewable_energy")
        content =
            "Renewable energy comes from sources that naturally replenish. Solar panels convert sunlight into electricity using photovoltaic cells. Biofuel is made from organic matter and is carbon-neutral because the plants absorbed CO\u2082 as they grew. Wind turbines, hydropower, and geothermal energy are other major renewables. In EcoVille, you craft solar panels from recycled plastic and glass, and biofuel from organic waste and water \u2014 showing how waste can become energy.";
    else if (lesson.id === "sustainable_city")
        content =
            "A sustainable city balances environmental, social, and economic needs. Carbon neutrality means the CO\u2082 a city emits is equal to what it removes. EcoVille\u2019s path to carbon neutrality requires: renewable energy (solar + biofuel), carbon capture and offsetting, clean water filtration, and sustainable materials. The Green Certificate (\uD83C\uDFC6) represents the final synthesis of all these technologies. Real cities like Copenhagen and Vancouver have set 2040-2050 carbon neutrality targets.";
    else if (lesson.id === "light_basics")
        content =
            "Light is electromagnetic radiation that behaves as both a wave and a particle (wave-particle duality). It travels at 299,792,458 m/s in a vacuum \u2014 the fastest speed in the universe. The visible spectrum (380nm to 740nm) is tiny compared to the full EM spectrum, which includes radio waves, microwaves, infrared, ultraviolet, X-rays, and gamma rays. Isaac Newton was the first to prove white light contains all colors by using a prism.";
    else if (lesson.id === "refraction")
        content =
            "Refraction is the bending of light when it passes between different media. Snell\u2019s Law (n\u2081sin\u03B8\u2081 = n\u2082sin\u03B8\u2082) predicts the angle change. When white light enters a prism, different wavelengths bend by different amounts (dispersion). Red bends the least, violet the most. This is why prisms split white light into a rainbow. In nature, raindrops act as tiny prisms, creating rainbows when sunlight passes through them at the right angle.";
    else if (lesson.id === "lenses")
        content =
            "A convex lens is thicker in the middle and focuses parallel light rays to a single focal point. A concave lens is thinner in the middle and spreads light rays apart. The focal length determines the lens\u2019s power \u2014 shorter focal length = stronger magnification. Telescopes use two convex lenses to magnify distant objects. Microscopes use a short-focal-length objective lens and a longer-focal-length eyepiece. Corrective eyeglasses use precisely shaped lenses to fix vision problems.";
    else if (lesson.id === "color_theory")
        content =
            "Additive color mixing combines colored lights: red + green = yellow, red + blue = magenta, green + blue = cyan, and all three = white. This is how screens work \u2014 every pixel has red, green, and blue subpixels. Subtractive color mixing (paints and filters) works differently: each layer subtracts wavelengths, so more layers = darker. A red filter blocks green and blue, passing only red. A Color Filter Set combines all three primary filters for precise wavelength control.";
    else if (lesson.id === "optics_tech")
        content =
            "Optics powers modern technology. Fiber optic cables use total internal reflection to transmit data as light pulses over long distances with minimal loss. Lasers (Light Amplification by Stimulated Emission of Radiation) produce coherent, monochromatic beams used in surgery, cutting, barcodes, and fiber optics. Cameras use compound lenses to focus light onto sensors. CD/DVD drives use lasers to read data from reflective pits. The Hubble Space Telescope is essentially a large reflecting telescope in orbit.";

    const overlay = scene.add
        .rectangle(0, 0, width, height, 0x000, 0.85)
        .setOrigin(0)
        .setDepth(60);

    const panel = scene.add.graphics().setDepth(61);
    panel.fillStyle(0x1a1510, 0.95);
    panel.fillRoundedRect(cx - 240, height / 2 - 180, 480, 360, 12);
    panel.lineStyle(2, 0x3498db, 0.5);
    panel.strokeRoundedRect(cx - 240, height / 2 - 180, 480, 360, 12);

    const closeIcn = scene.add
        .text(cx + 220, height / 2 - 170, "✕", {
            fontFamily: '"Inter"',
            fontSize: "16px",
            color: "#ff7675",
        })
        .setOrigin(0.5)
        .setDepth(65)
        .setInteractive({ useHandCursor: true });

    const title = scene.add
        .text(cx, height / 2 - 155, lesson.title, {
            fontFamily: '"Press Start 2P"',
            fontSize: "12px",
            color: "#3498db",
        })
        .setOrigin(0.5)
        .setDepth(62);

    const text = scene.add
        .text(cx, height / 2 - 60, content, {
            fontFamily: '"Inter"',
            fontSize: "14px",
            color: "#c8b89a",
            wordWrap: { width: 400 },
            lineSpacing: 6,
        })
        .setOrigin(0.5)
        .setDepth(62);

    const uiElements: Phaser.GameObjects.GameObject[] = [
        overlay,
        panel,
        closeIcn,
        title,
        text,
    ];

    let quizStarted = false;
    let completionAwarded = false;

    function showNextQuestion() {
        if (!quizStarted) {
            text.setVisible(false);
            quizStarted = true;
        }

        if (remaining.length === 0) {
            const done = scene.add
                .text(
                    cx,
                    height / 2 - 80,
                    "All questions answered! +20 bonus coins!",
                    {
                        fontFamily: '"Inter"',
                        fontSize: "13px",
                        color: "#2ecc71",
                        fontStyle: "bold",
                        align: "center",
                    },
                )
                .setOrigin(0.5)
                .setDepth(62);
            uiElements.push(done);
            gameStore.addCoins(20);
            scene.sound.play("sfx_coin", { volume: 0.5 });

            if (completionItem && !completionAwarded) {
                completionAwarded = true;
                gameStore.addToInventory(completionItem, 1);
                const certMsg = scene.add
                    .text(
                        cx,
                        height / 2 - 55,
                        `+1 ${completionItem === "materials_certificate" ? "Materials Expert Certificate" : "Item"} earned!`,
                        {
                            fontFamily: '"Inter"',
                            fontSize: "11px",
                            color: "#f1c40f",
                            fontStyle: "bold",
                            align: "center",
                        },
                    )
                    .setOrigin(0.5)
                    .setDepth(62);
                uiElements.push(certMsg);
                scene.sound.play("sfx_coin", { volume: 0.5 });
            }
            return;
        }

        const qData = remaining[0];
        const qTxt = scene.add
            .text(cx, height / 2 - 120, qData.q, {
                fontFamily: '"Inter"',
                fontSize: "14px",
                color: "#f1c40f",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: 440 },
            })
            .setOrigin(0.5)
            .setDepth(62);
        uiElements.push(qTxt);

        let qy = height / 2 - 60;
        const optionElements: Phaser.GameObjects.GameObject[] = [];

        const feedbackTxt = scene.add
            .text(cx, qy + 180, "", {
                fontFamily: '"Inter"',
                fontSize: "12px",
                color: "#e74c3c",
            })
            .setOrigin(0.5)
            .setDepth(63);
        uiElements.push(feedbackTxt);

        for (const [idx, opt] of qData.opts.entries()) {
            const btnG = scene.add.graphics().setDepth(62);
            btnG.fillStyle(0x3d2b1f, 0.85);
            btnG.fillRoundedRect(cx - 150, qy, 300, 38, 8);
            btnG.lineStyle(1, 0x8b6914, 0.5);
            btnG.strokeRoundedRect(cx - 150, qy, 300, 38, 8);

            const btnT = scene.add
                .text(cx, qy + 19, opt, {
                    fontFamily: '"Inter"',
                    fontSize: "12px",
                    color: "#fff",
                })
                .setOrigin(0.5)
                .setDepth(63);

            const zone = scene.add
                .zone(cx, qy + 19, 300, 38)
                .setInteractive({ useHandCursor: true })
                .setDepth(64);

            zone.on("pointerdown", () => {
                feedbackTxt.setText("");
                if (idx === qData.ans) {
                    scene.cameras.main.flash(200, 46, 204, 113);
                    scene.sound.play("sfx_coin", { volume: 0.5 });
                    gameStore.addCoins(lesson.reward);

                    const skillMap: Record<string, string> = {
                        recyclingFields: "recycling_mastery",
                        atomMeadows: "equation_balancing",
                        prismHeights: "optics_mastery",
                    };
                    gameStore.addSkillPoints(
                        skillMap[mapKey] || "equation_balancing",
                        1,
                    );

                    remaining.shift();

                    [qTxt, ...optionElements].forEach((el) => {
                        const i = uiElements.indexOf(el);
                        if (i !== -1) uiElements.splice(i, 1);
                        el.destroy();
                    });

                    showNextQuestion();
                } else {
                    scene.cameras.main.shake(200, 0.01);
                    feedbackTxt.setText("Incorrect. Try again!");
                    btnG.fillStyle(0x992d2d, 0.7);
                    scene.time.delayedCall(500, () => {
                        btnG.fillStyle(0x3d2b1f, 0.85);
                    });
                }
            });

            optionElements.push(btnG, btnT, zone);
            uiElements.push(btnG, btnT, zone);
            qy += 48;
        }
    }

    const startQuizBtn = scene.add
        .text(cx, height / 2 + 155, "Start Quiz", {
            fontFamily: '"Press Start 2P"',
            fontSize: "12px",
            color: "#2ecc71",
        })
        .setOrigin(0.5)
        .setDepth(63)
        .setInteractive({ useHandCursor: true });

    startQuizBtn.on("pointerdown", () => {
        startQuizBtn.destroy();
        showNextQuestion();
    });

    uiElements.push(startQuizBtn);

    closeIcn.on("pointerdown", () => {
        uiElements.forEach((o) => o.destroy());
    });
}
