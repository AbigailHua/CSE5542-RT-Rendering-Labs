const color_white = [1.0, 1.0, 1.0];
const h_levels = 100;
const v_levels = 100;
const mode = {
    cubeMap: -1,
    texture: 0,
    fullLight: 1,
    ambient: 2,
    diffuse: 3,
    specular: 4,
    light: 5
};
var cameraPos = [2, 0, 0.5];
var cameraCenter = [0, 0, 0.5];
var cameraViewUp = [0, 0, 1];
var cameraRotation = [0, 0, 0];
var isFirstPerson = false;
var firstPersonPos = [1, 0, 0.05];
var firstPersonCenter = [0, 0, 0.05];
var firstPersonViewUp = [0, 0, 1];
var firstPersonRotation = [0, 0, 0];

const objPath = {
    bookObj: "obj/book/bookpack_001_obj.obj",
    bookMtl: "obj/book/bookpack_001_mtl.mtl",
    plantObj: "obj/plant/eb_house_plant_01.obj",
    plantMtl: "obj/plant/eb_house_plant_01.mtl",
    ayaObj: "obj/aya/091_W_Aya_10K.obj",
    ayaMtl: "obj/aya/091_W_Aya_10K.mtl",
    girlObj: "obj/girl/girl_OBJ.obj",
    girlMtl: "obj/girl/girl_OBJ.mtl",
};

const texturePath = {
    wood: 'texture/darkwood.jpg',
    floor: 'texture/floor.jpg',
    wall: 'texture/gray-wall.png',
    cement: 'texture/cement.jpg',
    blue: 'texture/blue.jpg'
};

const wall = {
    thickness: .01,
    height: 1,
    width: .5,
};

const room = {
    height: 1,
    width : 2,
    len: 2,
};

const shelf = {
    thickness: .02,
    len: .2,
    width: .15,
}

const shelfPos = {
    y1: -.6,
    z1: .7,
    y2: -.2,
    z2: .55,
    y3: .35,
    z3: .65,
}