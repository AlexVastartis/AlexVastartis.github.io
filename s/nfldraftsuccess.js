const pointStyles = [
georgiastate,
charlotte,
southalabama,
utsa,
olddominion,
louisianamonroe,
floridaatlantic,
airforce,
coastalcarolina,
fiu,
liberty,
georgiasouthern,
buffalo,
uab,
akron,
louisiana,
navy,
umass,
army,
ballstate,
southflorida,
easternmichigan,
middletennessee,
appalachianstate,
ohio,
troy,
unlv,
texasstate,
westernkentucky,
northernillinois,
kentstate,
uconn,
centralmichigan,
marshall,
ucf,
arkansasstate,
westernmichigan,
newmexicostate,
toledo,
nevada,
eastcarolina,
bowlinggreen,
newmexico,
rutgers,
louisianatech,
boisestate,
hawaii,
northtexas,
miamioh,
temple,
wyoming,
utep,
coloradostate,
sanjosestate,
fresnostate,
southernmiss,
utahstate,
memphis,
vanderbilt,
iowastate,
rice,
louisville,
cincinnati,
wakeforest,
tulane,
kansasstate,
byu,
duke,
virginiatech,
sandiegostate,
texastech,
virginia,
kansas,
oregonstate,
utah,
indiana,
oklahomastate,
tulsa,
smu,
northcarolinastate,
arizona,
houston,
northwestern,
washingtonstate,
westvirginia,
syracuse,
mississippistate,
kentucky,
tcu,
bostoncollege,
southcarolina,
georgiatech,
missouri,
maryland,
oregon,
california,
baylor,
northcarolina,
illinois,
arizonastate,
olemiss,
iowa,
clemson,
colorado,
floridastate,
stanford,
arkansas,
minnesota,
purdue,
auburn,
pittsburgh,
wisconsin,
texasam,
washington,
michiganstate,
ucla,
texas,
miamifl,
tennessee,
nebraska,
georgia,
florida,
lsu,
pennstate,
michigan,
alabama,
oklahoma,
ohiostate,
usc,
notredame
];

const data = [
{ x: 3, y: 0 },
{ x: 4, y: 0 },
{ x: 4, y: 0 },
{ x: 4, y: 1 },
{ x: 5, y: 0 },
{ x: 7, y: 1 },
{ x: 8, y: 0 },
{ x: 9, y: 0 },
{ x: 9, y: 0 },
{ x: 10, y: 0 },
{ x: 10, y: 1 },
{ x: 15, y: 0 },
{ x: 15, y: 1 },
{ x: 15, y: 2 },
{ x: 17, y: 0 },
{ x: 18, y: 0 },
{ x: 18, y: 0 },
{ x: 26, y: 2 },
{ x: 26, y: 3 },
{ x: 30, y: 0 },
{ x: 30, y: 2 },
{ x: 31, y: 2 },
{ x: 32, y: 0 },
{ x: 33, y: 0 },
{ x: 34, y: 1 },
{ x: 35, y: 2 },
{ x: 38, y: 0 },
{ x: 39, y: 0 },
{ x: 39, y: 0 },
{ x: 41, y: 2 },
{ x: 42, y: 0 },
{ x: 43, y: 2 },
{ x: 43, y: 2 },
{ x: 44, y: 3 },
{ x: 48, y: 4 },
{ x: 53, y: 0 },
{ x: 53, y: 2 },
{ x: 54, y: 0 },
{ x: 60, y: 1 },
{ x: 61, y: 3 },
{ x: 65, y: 2 },
{ x: 66, y: 1 },
{ x: 66, y: 2 },
{ x: 66, y: 3 },
{ x: 69, y: 5 },
{ x: 72, y: 5 },
{ x: 73, y: 1 },
{ x: 78, y: 3 },
{ x: 79, y: 2 },
{ x: 80, y: 4 },
{ x: 87, y: 4 },
{ x: 91, y: 2 },
{ x: 105, y: 5 },
{ x: 108, y: 6 },
{ x: 111, y: 5 },
{ x: 116, y: 4 },
{ x: 116, y: 5 },
{ x: 122, y: 4 },
{ x: 126, y: 9 },
{ x: 127, y: 2 },
{ x: 130, y: 7 },
{ x: 131, y: 16 },
{ x: 133, y: 3 },
{ x: 144, y: 5 },
{ x: 148, y: 5 },
{ x: 150, y: 6 },
{ x: 152, y: 12 },
{ x: 158, y: 8 },
{ x: 162, y: 14 },
{ x: 163, y: 9 },
{ x: 166, y: 9 },
{ x: 167, y: 16 },
{ x: 169, y: 9 },
{ x: 170, y: 6 },
{ x: 172, y: 10 },
{ x: 172, y: 12 },
{ x: 172, y: 21 },
{ x: 174, y: 4 },
{ x: 175, y: 7 },
{ x: 177, y: 19 },
{ x: 184, y: 10 },
{ x: 187, y: 15 },
{ x: 188, y: 11 },
{ x: 197, y: 14 },
{ x: 198, y: 12 },
{ x: 202, y: 21 },
{ x: 209, y: 16 },
{ x: 212, y: 16 },
{ x: 212, y: 18 },
{ x: 214, y: 22 },
{ x: 216, y: 15 },
{ x: 219, y: 10 },
{ x: 226, y: 20 },
{ x: 228, y: 18 },
{ x: 236, y: 22 },
{ x: 244, y: 27 },
{ x: 249, y: 21 },
{ x: 251, y: 25 },
{ x: 255, y: 23 },
{ x: 255, y: 26 },
{ x: 258, y: 22 },
{ x: 272, y: 26 },
{ x: 274, y: 39 },
{ x: 276, y: 24 },
{ x: 277, y: 46 },
{ x: 278, y: 25 },
{ x: 279, y: 23 },
{ x: 280, y: 18 },
{ x: 292, y: 22 },
{ x: 295, y: 32 },
{ x: 297, y: 27 },
{ x: 297, y: 30 },
{ x: 302, y: 36 },
{ x: 315, y: 28 },
{ x: 322, y: 36 },
{ x: 337, y: 36 },
{ x: 357, y: 46 },
{ x: 358, y: 67 },
{ x: 360, y: 47 },
{ x: 368, y: 34 },
{ x: 371, y: 47 },
{ x: 373, y: 58 },
{ x: 375, y: 49 },
{ x: 381, y: 40 },
{ x: 401, y: 51 },
{ x: 401, y: 79 },
{ x: 414, y: 50 },
{ x: 485, y: 90 },
{ x: 524, y: 85 },
{ x: 525, y: 70 }
];
