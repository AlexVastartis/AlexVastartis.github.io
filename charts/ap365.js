const pointStyles = [
akron,
appalachianstate,
arizonastate,
arkansasstate,
army,
ballstate,
bostoncollege,
bowlinggreen,
buffalo,
california,
centralmichigan,
charlotte,
coloradostate,
eastcarolina,
easternmichigan,
fiu,
floridaatlantic,
georgiasouthern,
georgiastate,
georgiatech,
hawaii,
indiana,
kentstate,
louisiana,
louisianatech,
louisianamonroe,
memphis,
miamioh,
michiganstate,
middletennessee,
navy,
nebraska,
nevada,
newmexico,
newmexicostate,
northtexas,
northernillinois,
northwestern,
olddominion,
rice,
sandiegostate,
smu,
southflorida,
southernmiss,
stanford,
temple,
tulsa,
uab,
uconn,
umass,
utahstate,
utep,
vanderbilt,
virginia,
virginiatech,
westernkentucky,
westernmichigan,
houston,
sanjosestate,
unlv,
iowastate,
marshall,
ohio,
texasstate,
byu,
rutgers,
arizona,
syracuse,
toledo,
auburn,
baylor,
westvirginia,
southalabama,
wakeforest,
purdue,
wyoming,
minnesota,
arkansas,
maryland,
boisestate,
texastech,
oklahomastate,
pittsburgh,
illinois,
florida,
coastalcarolina,
fresnostate,
liberty,
jamesmadison,
texasam,
kansas,
mississippistate,
iowa,
kentucky,
utsa,
troy,
cincinnati,
northcarolinastate,
wisconsin,
southcarolina,
ucf,
airforce,
colorado,
miamifl,
washingtonstate,
louisville,
missouri,
duke,
tulane,
ucla,
kansasstate,
clemson,
northcarolina,
oklahoma,
olemiss,
oregonstate,
tcu,
notredame,
lsu,
tennessee,
utah,
texas,
oregon,
usc,
washington,
floridastate,
alabama,
pennstate,
ohiostate,
michigan,
georgia
];

const data = [
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 0, y: 0 },
{ x: 1, y: 0 },
{ x: 1, y: 0 },
{ x: 1, y: 0 },
{ x: 2, y: 0 },
{ x: 2, y: 0 },
{ x: 2, y: 0 },
{ x: 2, y: 0 },
{ x: 3, y: 0 },
{ x: 4, y: 0 },
{ x: 6, y: 0 },
{ x: 10, y: 0 },
{ x: 10, y: 0 },
{ x: 11, y: 0 },
{ x: 22, y: 0 },
{ x: 32, y: 0 },
{ x: 34, y: 0 },
{ x: 34, y: 0 },
{ x: 46, y: 0 },
{ x: 50, y: 0 },
{ x: 57, y: 0 },
{ x: 85, y: 0 },
{ x: 117, y: 0 },
{ x: 121, y: 0 },
{ x: 121, y: 0 },
{ x: 192, y: 1 },
{ x: 266, y: 1 },
{ x: 313, y: 1 },
{ x: 379, y: 2 },
{ x: 384, y: 2 },
{ x: 440, y: 3 },
{ x: 443, y: 1 },
{ x: 447, y: 2 },
{ x: 535, y: 2 },
{ x: 544, y: 3 },
{ x: 563, y: 3 },
{ x: 576, y: 4 },
{ x: 595, y: 2 },
{ x: 622, y: 2 },
{ x: 634, y: 2 },
{ x: 743, y: 2 },
{ x: 756, y: 2 },
{ x: 859, y: 2 },
{ x: 1043, y: 3 },
{ x: 1088, y: 4 },
{ x: 1260, y: 3 },
{ x: 1292, y: 3 },
{ x: 1803, y: 5 },
{ x: 2248, y: 5 },
{ x: 2271, y: 5 },
{ x: 2340, y: 5 },
{ x: 3838, y: 8 },
{ x: 4807, y: 11 },
{ x: 5294, y: 12 },
{ x: 6042, y: 10 },
{ x: 7303, y: 8 },
{ x: 7848, y: 13 },
{ x: 8169, y: 10 },
{ x: 8442, y: 13 },
{ x: 8724, y: 15 },
{ x: 8993, y: 7 },
{ x: 11227, y: 16 },
{ x: 12615, y: 16 },
{ x: 12744, y: 16 },
{ x: 12963, y: 16 },
{ x: 13159, y: 15 },
{ x: 15317, y: 16 },
{ x: 15923, y: 16 },
{ x: 16904, y: 16 },
{ x: 16925, y: 16 },
{ x: 17608, y: 16 },
{ x: 17855, y: 16 },
{ x: 22305, y: 16 },
{ x: 23595, y: 16 },
{ x: 24940, y: 16 }
];