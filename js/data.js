/* Tastenwerk – feste Daten: Tastaturlayouts, Lektionen, Wortliste, Tempotexte */

'use strict';

/* ---------- keyboard layouts ---------- */
const LAYOUTS = {
  ch: [
    ["§°","1+",'2"',"3*","4ç","5%","6&","7/","8(","9)","0=","'?","^`"],
    ["qQ","wW","eE","rR","tT","zZ","uU","iI","oO","pP","üè","¨!"],
    ["aA","sS","dD","fF","gG","hH","jJ","kK","lL","öé","äà","$£"],
    ["<>","yY","xX","cC","vV","bB","nN","mM",",;",".:","-_"]
  ],
  de: [
    ["^°","1!",'2"',"3§","4$","5%","6&","7/","8(","9)","0=","ß?","´`"],
    ["qQ","wW","eE","rR","tT","zZ","uU","iI","oO","pP","üÜ","+*"],
    ["aA","sS","dD","fF","gG","hH","jJ","kK","lL","öÖ","äÄ","#'"],
    ["<>","yY","xX","cC","vV","bB","nN","mM",",;",".:","-_"]
  ]
};
// 0 L-pinky, 1 L-ring, 2 L-middle, 3 L-index, 4 thumb, 6 R-index, 7 R-middle, 8 R-ring, 9 R-pinky
const ROW_FINGERS = [
  [0,0,1,2,3,3,6,6,7,8,9,9,9],
  [0,1,2,3,3,6,6,7,8,9,9,9],
  [0,1,2,3,3,6,6,7,8,9,9,9],
  [0,0,1,2,3,3,6,6,7,8,9]
];
const FINGER = ['linken kleinen Finger','linken Ringfinger','linken Mittelfinger','linken Zeigefinger','Daumen','Daumen','rechten Zeigefinger','rechten Mittelfinger','rechten Ringfinger','rechten kleinen Finger'];
const FINGER_VAR = ['--f-pinky','--f-ring','--f-middle','--f-index','--f-thumb','--f-thumb','--f-index','--f-middle','--f-ring','--f-pinky'];

/* ---------- lessons ---------- */
const DEFS = [
  {t:'Grundstellung', add:'asdfjklö'},
  {t:'E und I', add:'ei'},
  {t:'R und U', add:'ru'},
  {t:'G und H', add:'gh'},
  {t:'T und Z', add:'tz'},
  {t:'O und W', add:'ow'},
  {t:'N und C', add:'nc'},
  {t:'M und V', add:'mv'},
  {t:'Umschalttaste', shift:true},
  {t:'B und P', add:'bp'},
  {t:'Komma und Punkt', punct:',.'},
  {t:'Q, X und Y', add:'qxy'},
  {t:'Ä, Ü und ß', tCH:'Ä und Ü', add:'äü', addDE:'ß'},
  {t:'Bindestrich, Doppelpunkt, Fragezeichen', punct:'-:?'},
  {t:'Zahlen', digits:true}
];
const EX_NAMES = ['Neue Tasten','Kombinationen','Wörter','Text'];

/* ---------- word list (nouns capitalised) ---------- */
const WORDS = (`das dass die der den dem des ein eine einen einem einer es er sie wir ihr ich du und oder aber als also auch auf aus bei bis da dann doch durch für hier ja nein nicht noch nun nur ob ohne sehr so um unter von vor was weil wenn wie wo zu zum zur mit nach seit sich sind ist war hat haben hatte kann will soll muss darf mag alle alles viel viele wenig gut neu alt groß klein lang kurz hoch tief schnell leise laut rot blau grün gelb weiß schwarz warm kalt hell dunkel früh spät heute morgen gestern immer nie oft selten jetzt bald gern lieb klug fleißig ruhig still frei fest leicht schwer süß sauer satt froh müde wach fad lahm fies dick faul kahl edel eilig heiter sauber teuer wild flach frisch all fall falls lass lasse elf fee see seil leid lied eile feile seife dies diese fiel kiel ski sei leise lisa fass ruf rufe drei reise lauf ufer luft kurs fluss rasse riese irre ferse dusel heu hase hals gas grau gruß sage sehe legt geld tag zeit satz zug hut gut weg wolf woche ohr rose dose
Haus Hund Katze Maus Baum Wald Feld See Fluss Meer Berg Tal Stadt Dorf Land Weg Straße Auto Rad Bus Bahn Zug Schiff Brot Milch Käse Wasser Saft Tee Salz Zucker Apfel Birne Nuss Kuchen Suppe Reis Ei Tisch Stuhl Bett Lampe Tür Fenster Dach Wand Boden Garten Blume Gras Laub Stein Sand Erde Luft Feuer Licht Sonne Mond Stern Himmel Regen Schnee Wind Wolke Jahr Monat Woche Tag Nacht Abend Stunde Zeit Kind Frau Mann Vater Mutter Bruder Schwester Freund Freundin Lehrer Schule Klasse Heft Buch Seite Wort Satz Text Brief Karte Bild Farbe Ball Spiel Lied Musik Tanz Fest Ferien Reise Arbeit Hand Fuß Kopf Auge Ohr Nase Mund Zahn Haar Herz Name Zahl Frage Antwort Idee Glück Ruhe Kaffee Fahrrad Telefon Taste Finger Tastatur Computer Maschine Papier Stift Feder Tinte Linie Zeile Fehler Übung Lektion Gras Kiste Seil Saal Fass Ast Hose Rock Jacke Uhr Wiese Rose Hase Igel Fuchs Vogel Fisch Kuh Pferd Ziege Quelle Taxi Yoga Pizza Pause Kerze Wolle
gehen kommen laufen rennen sehen hören sagen fragen lesen schreiben tippen rechnen malen singen spielen lernen lachen weinen essen trinken schlafen wohnen arbeiten kaufen suchen finden geben nehmen halten legen stellen machen tun denken wissen glauben fahren fliegen sitzen stehen liegen helfen danken bauen kochen backen waschen öffnen schließen warten zeigen nennen bringen rufen reisen raten fallen fassen lassen heilen hoffen tragen zahlen ziehen`).split(/\s+/).filter(Boolean);

/* ---------- tempo texts ---------- */
const PASSAGES = [
  'Wer mit zehn Fingern schreibt, schaut nicht mehr auf die Tasten, sondern auf den Text. Die Hände bleiben ruhig über der Grundreihe liegen, und jeder Finger kennt seinen Weg. Am Anfang geht es langsam, doch wer jeden Tag ein wenig trainiert, wird schnell sicherer.',
  'Im Herbst färben sich die Blätter im Wald gelb, rot und braun. Am Morgen liegt oft Nebel über den Feldern, und die Luft riecht nach feuchter Erde. Wer früh aufsteht, sieht vielleicht ein Reh am Waldrand stehen, bevor die Sonne langsam über die Hügel steigt.',
  'Die erste Schreibmaschine, die in großer Zahl verkauft wurde, kam vor rund hundertfünfzig Jahren auf den Markt. Ihre Tasten waren so angeordnet, dass sich die Hebel beim schnellen Tippen nicht verhakten. Aus dieser Anordnung entstand die Tastatur, die wir bis heute verwenden.',
  'Unser Zug fährt pünktlich um acht Uhr ab. Wir haben belegte Brote, Birnen und eine Flasche Tee eingepackt. Am Fenster ziehen Dörfer, Wiesen und kleine Seen vorbei, und in der Ferne sind schon die ersten Berge mit Schnee auf den Gipfeln zu sehen.',
  'Ein gutes Rezept für Pfannkuchen braucht nur wenige Zutaten: Mehl, Milch, Eier und eine Prise Salz. Den Teig kurz ruhen lassen, dann in einer heißen Pfanne goldbraun backen. Mit Apfelmus oder Zimt und Zucker schmecken sie besonders gut.',
  'Bienen fliegen an einem sonnigen Tag von Blüte zu Blüte und sammeln Nektar. Eine einzige Biene besucht dabei mehrere tausend Blumen. Im Stock wird der Nektar zu Honig verarbeitet, der dem Volk den Winter über als Vorrat dient.',
  'Hast du heute schon geübt? Zehn Minuten am Tag reichen völlig aus. Wichtig ist, dass du regelmäßig schreibst und die Finger immer wieder in die Grundstellung zurückkehren. Fehler gehören dazu, denn aus ihnen lernt man am meisten.'
];

const SAMPLE_CUSTOM = 'Hier kannst du einen eigenen Text einfügen, zum Beispiel einen Abschnitt aus einem Buch, deine Hausaufgaben oder eine Liste mit schwierigen Wörtern. Danach tippst du ihn genau wie eine Übung ab.';
