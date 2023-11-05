const pointStyles = [
'dash',
airforce,
akron,
arizona,
buffalo,
charlotte,
eastcarolina,
fiu,
floridaatlantic,
georgiastate,
hawaii,
indiana,
iowastate,
kansas,
kansasstate,
kentstate,
louisianamonroe,
mississippistate,
newmexico,
newmexicostate,
olddominion,
oregonstate,
rutgers,
southalabama,
southcarolina,
southflorida,
temple,
uab,
ucf,
unlv,
utep,
utsa,
virginia,
wakeforest,
washingtonstate,
westernmichigan,
coastalcarolina,
liberty,
northwestern,
rice,
southernmiss,
baylor,
easternmichigan,
louisiana,
louisville,
bostoncollege,
kentucky,
memphis,
navy,
northcarolina,
oklahomastate,
tulane,
ballstate,
georgiasouthern,
houston,
northcarolinastate,
ohio,
texastech,
virginiatech,
arkansasstate,
missouri,
purdue,
texasstate,
westernkentucky,
olemiss,
syracuse,
arkansas,
marshall,
middletennessee,
oregon,
utahstate,
vanderbilt,
nevada,
northernillinois,
toledo,
wisconsin,
wyoming,
coloradostate,
stanford,
westvirginia,
iowa,
maryland,
pennstate,
smu,
centralmichigan,
cincinnati,
arizonastate,
bowlinggreen,
duke,
sanjosestate,
ucla,
uconn,
washington,
tcu,
texasam,
auburn,
georgiatech,
michiganstate,
boisestate,
sandiegostate,
army,
california,
illinois,
tennessee,
appalachianstate,
troy,
umass,
byu,
miamioh,
florida,
floridastate,
louisianatech,
northtexas,
colorado,
georgia,
lsu,
minnesota,
clemson,
utah,
fresnostate,
texas,
miamifl,
pittsburgh,
tulsa,
ohiostate,
michigan,
usc,
nebraska,
oklahoma,
notredame,
alabama
];

const data = [
  { x: -6, y: 0 },
 { x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.47, y: 17.861 },
{ x: -0.4, y: 18.414 },
{ x: -0.4, y: 18.414 },
{ x: -0.4, y: 18.414 },
{ x: -0.4, y: 18.414 },
{ x: -0.4, y: 18.414 },
{ x: -0.3, y: 19.069 },
{ x: -0.3, y: 19.069 },
{ x: -0.3, y: 19.069 },
{ x: -0.3, y: 19.069 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.2, y: 19.552 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: 0, y: 19.947 },
{ x: 0, y: 19.947 },
{ x: 0, y: 19.947 },
{ x: 0, y: 19.947 },
{ x: 0, y: 19.947 },
{ x: 0.07, y: 19.898 },
{ x: 0.07, y: 19.898 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.2, y: 19.552 },
{ x: 0.2, y: 19.552 },
{ x: 0.2, y: 19.552 },
{ x: 0.2, y: 19.552 },
{ x: 0.2, y: 19.552 },
{ x: 0.3, y: 19.069 },
{ x: 0.3, y: 19.069 },
{ x: 0.3, y: 19.069 },
{ x: 0.34, y: 18.827 },
{ x: 0.34, y: 18.827 },
{ x: 0.34, y: 18.827 },
{ x: 0.34, y: 18.827 },
{ x: 0.4, y: 18.414 },
{ x: 0.4, y: 18.414 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.5, y: 17.603 },
{ x: 0.6, y: 16.661 },
{ x: 0.6, y: 16.661 },
{ x: 0.61, y: 16.561 },
{ x: 0.61, y: 16.561 },
{ x: 0.61, y: 16.561 },
{ x: 0.8, y: 14.485 },
{ x: 0.8, y: 14.485 },
{ x: 0.88, y: 13.543 },
{ x: 0.88, y: 13.543 },
{ x: 0.88, y: 13.543 },
{ x: 0.88, y: 13.543 },
{ x: 1, y: 12.099 },
{ x: 1, y: 12.099 },
{ x: 1, y: 12.099 },
{ x: 1.1, y: 10.893 },
{ x: 1.1, y: 10.893 },
{ x: 1.15, y: 10.297 },
{ x: 1.15, y: 10.297 },
{ x: 1.3, y: 8.568 },
{ x: 1.3, y: 8.568 },
{ x: 1.4, y: 7.486 },
{ x: 1.42, y: 7.278 },
{ x: 1.42, y: 7.278 },
{ x: 1.42, y: 7.278 },
{ x: 1.5, y: 6.476 },
{ x: 1.6, y: 5.546 },
{ x: 1.7, y: 4.702 },
{ x: 1.8, y: 3.948 },
{ x: 1.96, y: 2.922 },
{ x: 2.23, y: 1.66 },
{ x: 2.31, y: 1.384 },
{ x: 2.71, y: 0.507 },
{ x: 3.01, y: 0.215 },
{ x: 3.31, y: 0.083 },
{ x: 3.41, y: 0.06 },
{ x: 3.81, y: 0.014 },
{ x: 3.85, y: 0.012 },
{ x: 6, y: 0 }
];