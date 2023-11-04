const pointStyles = [
'dash',
charlotte,
fiu,
georgiastate,
unlv,
louisianamonroe,
floridaatlantic,
kentstate,
buffalo,
utep,
southalabama,
uab,
newmexicostate,
temple,
easternmichigan,
rice,
wakeforest,
arkansasstate,
eastcarolina,
newmexico,
indiana,
ballstate,
sanjosestate,
uconn,
akron,
memphis,
texasstate,
utsa,
smu,
duke,
southflorida,
coloradostate,
northtexas,
louisville,
tulane,
wyoming,
northwestern,
iowastate,
louisiana,
kansasstate,
oregonstate,
liberty,
washingtonstate,
nevada,
umass,
utahstate,
olddominion,
hawaii,
mississippistate,
houston,
kansas,
ohio,
northernillinois,
texastech,
westernmichigan,
vanderbilt,
ucf,
marshall,
airforce,
arizona,
baylor,
illinois,
toledo,
southcarolina,
oklahomastate,
northcarolinastate,
purdue,
louisianatech,
middletennessee,
bowlinggreen,
tulsa,
kentucky,
sandiegostate,
southernmiss,
troy,
cincinnati,
stanford,
olemiss,
rutgers,
maryland,
ucla,
byu,
tcu,
virginia,
california,
iowa,
westernkentucky,
bostoncollege,
centralmichigan,
fresnostate,
oregon,
missouri,
utah,
miamioh,
army,
arizonastate,
colorado,
michiganstate,
northcarolina,
minnesota,
navy,
arkansas,
wisconsin,
syracuse,
georgiatech,
pittsburgh,
virginiatech,
washington,
texasam,
westvirginia,
georgiasouthern,
miamifl,
florida,
clemson,
auburn,
coastalcarolina,
lsu,
georgia,
floridastate,
tennessee,
nebraska,
pennstate,
usc,
texas,
boisestate,
oklahoma,
notredame,
michigan,
alabama,
ohiostate,
appalachianstate
];

const data = [
  { x: -3, y: 0 },
{ x: -2.42, y: 1.067 },
{ x: -2.34, y: 1.291 },
{ x: -2.05, y: 2.44 },
{ x: -1.62, y: 5.37 },
{ x: -1.3, y: 8.568 },
{ x: -1.13, y: 10.534 },
{ x: -1.1, y: 10.893 },
{ x: -0.88, y: 13.543 },
{ x: -0.86, y: 13.781 },
{ x: -0.85, y: 13.899 },
{ x: -0.75, y: 15.057 },
{ x: -0.67, y: 15.937 },
{ x: -0.5, y: 17.603 },
{ x: -0.49, y: 17.691 },
{ x: -0.48, y: 17.777 },
{ x: -0.47, y: 17.861 },
{ x: -0.46, y: 17.945 },
{ x: -0.45, y: 18.026 },
{ x: -0.44, y: 18.107 },
{ x: -0.41, y: 18.339 },
{ x: -0.39, y: 18.486 },
{ x: -0.36, y: 18.696 },
{ x: -0.34, y: 18.827 },
{ x: -0.29, y: 19.126 },
{ x: -0.29, y: 19.126 },
{ x: -0.28, y: 19.18 },
{ x: -0.28, y: 19.18 },
{ x: -0.27, y: 19.233 },
{ x: -0.26, y: 19.284 },
{ x: -0.26, y: 19.284 },
{ x: -0.24, y: 19.381 },
{ x: -0.24, y: 19.381 },
{ x: -0.2, y: 19.552 },
{ x: -0.13, y: 19.779 },
{ x: -0.13, y: 19.779 },
{ x: -0.12, y: 19.804 },
{ x: -0.11, y: 19.827 },
{ x: -0.11, y: 19.827 },
{ x: -0.1, y: 19.848 },
{ x: -0.1, y: 19.848 },
{ x: -0.08, y: 19.883 },
{ x: -0.06, y: 19.911 },
{ x: -0.05, y: 19.922 },
{ x: -0.04, y: 19.931 },
{ x: -0.04, y: 19.931 },
{ x: -0.03, y: 19.938 },
{ x: -0.02, y: 19.943 },
{ x: 0.03, y: 19.938 },
{ x: 0.04, y: 19.931 },
{ x: 0.07, y: 19.898 },
{ x: 0.07, y: 19.898 },
{ x: 0.1, y: 19.848 },
{ x: 0.1, y: 19.848 },
{ x: 0.12, y: 19.804 },
{ x: 0.16, y: 19.693 },
{ x: 0.18, y: 19.627 },
{ x: 0.2, y: 19.552 },
{ x: 0.21, y: 19.512 },
{ x: 0.21, y: 19.512 },
{ x: 0.22, y: 19.47 },
{ x: 0.22, y: 19.47 },
{ x: 0.22, y: 19.47 },
{ x: 0.23, y: 19.426 },
{ x: 0.24, y: 19.381 },
{ x: 0.25, y: 19.333 },
{ x: 0.26, y: 19.284 },
{ x: 0.27, y: 19.233 },
{ x: 0.27, y: 19.233 },
{ x: 0.28, y: 19.18 },
{ x: 0.29, y: 19.126 },
{ x: 0.31, y: 19.011 },
{ x: 0.33, y: 18.89 },
{ x: 0.33, y: 18.89 },
{ x: 0.33, y: 18.89 },
{ x: 0.36, y: 18.696 },
{ x: 0.41, y: 18.339 },
{ x: 0.42, y: 18.263 },
{ x: 0.42, y: 18.263 },
{ x: 0.43, y: 18.186 },
{ x: 0.44, y: 18.107 },
{ x: 0.47, y: 17.861 },
{ x: 0.48, y: 17.777 },
{ x: 0.48, y: 17.777 },
{ x: 0.52, y: 17.425 },
{ x: 0.52, y: 17.425 },
{ x: 0.52, y: 17.425 },
{ x: 0.54, y: 17.241 },
{ x: 0.55, y: 17.147 },
{ x: 0.56, y: 17.052 },
{ x: 0.56, y: 17.052 },
{ x: 0.61, y: 16.561 },
{ x: 0.65, y: 16.149 },
{ x: 0.66, y: 16.043 },
{ x: 0.67, y: 15.937 },
{ x: 0.68, y: 15.83 },
{ x: 0.68, y: 15.83 },
{ x: 0.7, y: 15.613 },
{ x: 0.7, y: 15.613 },
{ x: 0.72, y: 15.393 },
{ x: 0.74, y: 15.169 },
{ x: 0.75, y: 15.057 },
{ x: 0.76, y: 14.944 },
{ x: 0.77, y: 14.83 },
{ x: 0.83, y: 14.135 },
{ x: 0.86, y: 13.781 },
{ x: 0.91, y: 13.184 },
{ x: 0.91, y: 13.184 },
{ x: 0.94, y: 12.824 },
{ x: 0.96, y: 12.582 },
{ x: 0.98, y: 12.34 },
{ x: 1, y: 12.099 },
{ x: 1.01, y: 11.978 },
{ x: 1.03, y: 11.736 },
{ x: 1.05, y: 11.494 },
{ x: 1.3, y: 8.568 },
{ x: 1.32, y: 8.347 },
{ x: 1.45, y: 6.972 },
{ x: 1.51, y: 6.379 },
{ x: 1.54, y: 6.094 },
{ x: 1.64, y: 5.198 },
{ x: 1.74, y: 4.39 },
{ x: 1.83, y: 3.738 },
{ x: 1.89, y: 3.344 },
{ x: 2.17, y: 1.894 },
{ x: 2.18, y: 1.853 },
{ x: 2.22, y: 1.697 },
{ x: 2.25, y: 1.587 },
{ x: 2.26, y: 1.552 },
{ x: 2.27, y: 1.517 },
{ x: 2.35, y: 1.261 }
];
