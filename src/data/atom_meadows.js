export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 20;
export const TILE_SIZE = 64;

// Tile index reference (RPGpack_sheet.png):
//   0 = grass        5 = dirt path       10 = water
//  60-66 = beige building walls/floors
//  69-75 = gray stone path/floor

const G = 0;
const P = 5;
const W = 10;

const B_TL = 60;
const B_TM = 61;
const B_TR = 62;
const B_ML = 63;
const B_MM = 64;
const B_MR = 65;
const B_BL = 66;
const B_BM = 66;
const B_BR = 66;

export const groundGrid = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,G,G,G,G,G,G,B_TL,B_TM,B_TM,B_TR,G,G,B_TL,B_TM,B_TM,B_TR,G,G,W],
  [W,G,G,G,G,G,G,B_ML,B_MM,B_MM,B_MR,G,G,B_ML,B_MM,B_MM,B_MR,G,G,W],
  [W,G,G,P,P,P,P,B_BL,B_BM,B_BM,B_BR,P,P,B_BL,B_BM,B_BM,B_BR,G,G,W],
  [W,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,W],
  [W,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,W],
  [W,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,W],
  [W,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,W],
  [W,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,W],
  [W,G,G,G,G,G,B_TL,B_TM,B_TR,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,B_ML,B_MM,B_MR,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,B_BL,B_BM,B_BR,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

// Decoration layer: trees, rocks, etc. (-1 = empty)
export const decorationGrid = [
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
];

// POI positions in tile coordinates
export const pois = {
  lab:     { tileX: 8, tileY: 1, scene: 'LabScene',  label: 'Laboratory' },
  library: { tileX: 13, tileY: 1, scene: 'LibraryScene', label: 'Library' },
  shop:    { tileX: 5, tileY: 6, scene: 'ShopScene',  label: 'Shop' },
};

// NPC positions in tile coordinates
export const npcs = [
  {
    id: 'panting_pete',
    name: 'Panting Pete',
    tileX: 9,
    tileY: 9,
    color: 0x44aa44,
  },
];
