# MicroProject projektkezelő alkalmazás
**Fürjes-Benke Péter**

## Bevezetés
Manapság, az informatika előretörésével, egyre fontosabbá válik, hogy megbízható, stabil szoftverek készüljenek. Ezen belül is főleg a webes alkalmazások térnyerése jelentős. A felhasználók már az alkalmazásokra szolgáltatásként tekintenek, nem szeretnének foglalkozni azok telepítésével, hanem egyszerűen az interneten kerseztül, böngészőből szeretnék elérni a szükséges funkcionalitásokat. Ez abból is látszik, hogy a világon 2022-ben már körülbelül 5 milliárd aktív felhasználója van az internetenek. 

Az ilyen mértékű terhelés viszont komoly problémát okoz az internetes szolgáltatásokat futtató szerverek számára. Igaz manapság már közel korlátlan erőforrás áll rendelkezésre, köszönhetően a felhőszolgáltatóknak, de ennek költségét még a legnagyobb vállalatoknak sem nyereséges megfizetni. A céljuk, hogy szolgáltatásuk folyamatosan rendelkezésre álljon a felhasználóik számára, komolyabb kimaradások nélkül.

Ez az elvárás vezetett el odáig, hogy a klasszikus, monolitikus alkalmazások háttérbe szorultak, ugyanis nehezen skálázhatók az aktuális igényekhez, továbbá fejlesztésük is problémás lehet több csapat esetén. Emiatt kezdett el terjedni az a megközelítés, hogy az alkalmazásokat kisebb, önálló részekre bontják fel, mikroszolgáltatásokra. Minden egyes rész egy jól körülhatárolt feladatot lát el, és működése csekély mértékben függ a tobbi szolgáltatástól. Ha az egyik szolgáltatás leáll, attól még a többi továbbra is elérhető marad a felhasználók számára. Továbbá, ha valamelyik szolgáltatáson nagyobb a terhelés, abból könnyen felindítható több példány is.  

Az én célom egy projektkezelő alkalmazás készítése volt, melynek funkcionalitása mikroszolgáltatásokból épül fel. Az egyes szolgáltatások Docker konténerben futtathatók, és a funkcionalitásuk csak egy API gateway-en keresztül érhető el a külvilág számára. Mikroszolgáltatás architektúráról lévén szó, az egyes szolgáltatásoknak egymástól függetlenül működőképesnek kell maradniuk. Ennek értelmében a rendszernek ellen kell állnia a tranziens hibáknak.

### Funkcionalitás részletes leírása
A programnak képesnek kell lennie projektek kezelésére, azon belül a feladatok állapotának nyomonkövetésére. A közös munka megkönnyítése érdekében a felhasználók az egyes feladatok alatt kommenteket írhatnak a haladásukról, vagy éppen javaslatokat tehetnek. Ezen felül a program lehetőséget ad találkozók létrehozására, mely bekerül a résztvevők naptárjába. A találkozókon elhangzott fontos információkról összefoglalókat lehet írni, mely a későbbiekben is visszanézhető. Emellett minden az adott projektben résztvevő értesítést kap a projektet érintő változásokról, módosításokról a regisztrációkor megadott e-mail címükre.

## Architektúra terv
<p align="center">
<img src="resources/project_manager.png" alt="Architektúra ábra" height="450"/>
</p>

Az architektúra tervezése során a ```Domain Driven Design```-t követtem annak érdekében, hogy meghatározzam a szükséges mikroszolgáltatások körét. Ennek megfelelően összesen 5 alapvető szolgáltatásra bontottam fel az alkalmazást, melyek a ```polyglot``` elvet követve különböző programozási nyelven íródnak. A szolgáltatások elérésének biztosításáért a *Traefik API Gateway* felelős. Továbbá ezen keresztül érhető el az alkalmazás felhasználói felülete is. A szolgáltatások közötti üzenetsor alapú aszinkron kommunikációért pedig egy *RabbitMQ* példány felel.

### Authentikációs szolgáltatás
A felhasználók authentikációja és authorizációja a Keycloak alkalmazás felel, mely MySql adatbázisban tárolja az adatokat. Ez a szolgáltatás biztosítja a felhasználók regisztrációját, továbbá a rendszergazdák számára a felhasználói jogosultságok állítását.

### Felhasználói szolgáltatás
Egy *Spring Boot* keretrendszerben készített szolgáltatás, melynek feladata a felhasználókról információk lekérése az authentikációs szolgáltatástól. A funkcionalitását REST API-n keresztül publikálja.

### Projekteket kezelő szolgáltatás
A komponens egy *.Net* alapú alkalmazás, mely REST API-n keresztül biztosítja a projektek létrehozását, és azok kezelését. Az adatok struktúrájához igazodva ebben az esetben már egy dokumentum alapú *MongoDB* adatbázisban kerülnek eltárolásra a szükséges információk. Az adatbázis elérése ebben az esetben is a ```Repository``` mintának megfelelően egy burkoló osztállyal történik.

### Feladatokat kezelő szolgáltatás
A projekteken belül feladatokat lehet létrehozni. Ezek létrehozásáért és kezelésért felel ez a szolgáltatás. A funkciókat REST API-n keresztül biztosítja, a projektkezelő alkalmazáshoz hasonlóan. Ez esetben is a ```Repository``` mintát követi a komponens architektúrája, mely egy *.Net 5* alkalmazásban lett implementálva és maguk az adatok pedig egy *MongoDB* adatbázisban tárolódnak.

### Megbeszéléseket kezelő szolgáltatás
Ennek a komponensnek a feladat az egyes projektekhez tartozó megbeszélések létrehozásáért, és azok kezeléséért felelős funkciók biztosítása. A **projekt** szoláltatáshoz hasonlóan ez is egy *.Net* alkalmazás és az adatok *MongoDB*-ben tárolódnak.

### Hozzászólásokat kezelő szolgáltatás
A feladat leírásának megfelelően a felhasználóknak lehetősége van kommenteket írni az egyes feladatokhoz. Az ehhez szükséges funkciók biztosítása a feladata ennek a szolgáltatásnak. Ez a szolgáltatás is egy *.Net 5* alkalmazás, mely *MongoDB*-ben tárolja a hozzászólásokat.

### Értesítő szolgáltatás
Ez a *Go* nyelven írt szolgáltatás felel azért, hogy értesítse a felhasználókat abban az esetben, ha valamelyik projektjükben változás történt. Mivel ehhez mindegyik korábbi szolgáltatással kapcsolatban kell lennie, ezért egy üzenetsor alapú kommunikációt valósít meg a *RabbitMQ* segítségével. A megkapott üzeneteket pedig továbbítja e-mail-ben a felhasználóknak a *SendGrid API* segítségével.

### Webszerver
A webszerver feladata, hogy elérhetővé tegye a React keretrendszerben megírt weboldalt, mely - felhasználva a korábbi szolgáltatásokat - biztosítja a teljes rendszer funkcionalitását. Ez a szolgáltatás egy *NGINX* webszervert használ.

## API gateway
A MicroProject alkalmazás több szolgáltatásból épül fel, és ezek mindegyike egy meghatározott REST interfészen keresztül publikálja a szolgáltatásait. Annak érdekében, hogy egy címen keresztül el lehessen érni az összes szolgáltatást egy API gatewayt használtam, azon belül is a *Traefik* megoldását, mely egyszerűen konfigurálható a  *Docker Compose* konfigurációs fájljával együtt. A ```docker-compose.yml``` fájlban elég csak megadni a route-olási szabályokat az egyes szolgáltatásokhoz, amik alapján a *Traefik* pedig konfigurálja az elérési utakat. Ezek után már a frontend fejlesztésénél elég volt a *Traefik* által publikált címet, mint alap URL-t használni, és a kérések a megfelelő mikroszolgáltatáshoz irányítódnak.

Az egységes interfészen kívül még előnye az API Gateway használatának, hogy biztonságos *HTTPS* kapcsolatot elég csak kifelé biztosítani, a mögötte lévő szolgáltatások egyszerű *HTTP* protokollon kommunikálhatnak egymással. Továbbá a Traefik egyéb szolgáltatásokat is nyújt, mint például a ```Forward Authentication```, amelyről a következő fejezetben lesz szó.

## Felhasználó authentikáció
### Korábbi megoldás
<p align=center>
<img src="resources/authentication_flow.png" alt="Authentikációs ábra"/>
</p>

Kezdetben a **Felhasználói szolgáltatás** feladatai közé tartozott, hogy biztosítsa a felhasználók authentikációját. Amikor a felhasználó sikeresen bejelentkezett, akkor kapott egy ```JWT```(Json Web Token)-t.
Ezzel pedig engedélyt kapott arra, hogy elérje a többi szolgáltatást. Az **API Gateway** minden védett erőforrás elérése előtt intézett egy lekérdezést a **Felhasználói szolgáltatás** felé, hogy az adott JWT token érvényes-e még. Ezt a *Traefik* által biztosított ```Forward Authentication``` teszi lehetővé, mely a ```Federated Identity``` mintát követi.

### Oauth
```
IDE JÖN MAJD KÉP AZ OAUTHról
```
Ha védelemről van szó, akkor általánosságban azt szokás mondani, hogy érdemes a már jól bevált, megbízható megoldásokat előnyben részesíteni a saját megoldással szemben. Pontosan ezért döntöttem úgy, hogy inkább az OAuth ```Authrozation Code Flow``` megoldását választom a felhasználók authentikációjára és authorizációjára. Az OAuth több metódust is kínál a token megszerzésére. Egy lehetséges alternatíva lett volna az ```Implicit Flow``` használata, de mivel előbbi opció duplán validálja, hogy megbízható kliens kap-e engedélyt, így arra esett a választásom.  Authorizációs szervernek a nyílt forráskódú **Keycloak** rendszert választottam, mely Docker konténerből onpremise futattható. Ez a szoftver teszti lehetővé a felhasználók bejelentkezését, kijelenetkezését és regisztrációját.

Az authorizáció ebben az esetben úgy működik, hogy a felhasználó a **Keycloak** bejelenetkeztető oldalára irányítódik át, megadja az adatait vagy ha még nincs fiókja, akkor regisztrál, majd kap egy authorizációs ```code```-ot. Azt egyszer felhasználhatja ```access```, ```refresh``` és ```id``` token lekérésére. A programom ezek közül csak az ```access``` tokent használja fel, mely ez esetben is ```JWT``` formátumú, tehát a rendszer kompatibilis maradt a korábbi megoldáshoz elkészített infrastruktúrával. Az ```access``` token segítségével pedig hozzáférést nyer a védett erőforrásokhoz. Mivel minden genenerált token rendelkezik egy aláírással, amihez a titkot csak a **Keycloak** szolgáltatás ismeri, így biztosított, hogy a támadók kellően nehezen tudnak olyan tokent generálni, amit a szolgáltatás érvényesnek ítélne. Az **API Gateway** feladata, hogy ellenőriztesse az ```access``` token hitelességét a **Keycloak** szolgáltatással minden védett erőforráshoz intézett kérés esetén. Ha a token nem megfelelő, előfordulhat, hogy nem kell a **Keycloak**-ba újra bejelentkezni. Ebben az esetben csak az ```access``` token érvényessége járt le, nem a felhasználó munkamenete. Ellenkező esetben be kell jelentkeznie.

## Projektek kezelése
Ahogy az architektúra tervnél már ismertettem, a projektek kezelését 4 mikroszolgáltatásra osztottam. Ezek a domain szerint a következők:
- projekt
- feladat
- hozzászólás
- megbeszélés.

A **projekt** szolgáltatás felel a legfelsőbb szintű projekt objektumokért. Ezek tartalmazzák az adott projekt címét, létrehozóját és a tagokat, akik az adott projektben dolgoznak. A projekt szolgáltatásban implementáltam bizonyos fokú jogosultságkezelést. Vagyis egy projektet csak a projektgazda módosíthat, a tagoknak nincs ehhez joguk. A projekteken belül tetszőleges mennyiségű feladat hozható létre, mely kezeléséért felel a **feladat** szolgáltatás. Feladatot bármelyik tag felvehet egy projektben, ez nincs korlátozva. A feladatokhoz hozzá lehet rendelni felhasználókat, akiknek azt el kell végezni. Ezen felül lehet módosítani a feladat állapotát, annak érdekében, hogy nyomon lehessen követni a projekt előrehaladását. A felhasználóknak lehetősége van hozzászólásokat írni az egyes feladatokhoz, ezzel is könnyítve a közös munkát. Mivel domain szinten ez a funkcionalitás is független a többitől, ezért kiszerveztem a megjegyzések kezelését a **hozzászólás** szolgáltatásba. Gondolván arra, hogy egy projekt során több konzultációra is szükség lehet a résztvevők között, ezért ennek kezelésére létrehoztam a **megbeszélés** szolgáltatást. A felhasználóknak lehetőségük van felvenni a megbeszéléseket, mint eseményeket, aminek van egy kezdő időpontja, továbbá azt is meg lehet határozni, hogy előreláthatólag meddig fog tartani. Továbbá lehetőség van arra is, hogy jegyzeteket rendeljenek az egyes megbeszélésekhez, így az elhangzott fontos információk később is elérhetők központilag a rendszerben.

### Adatok tárolása
Mind a 4 szolgáltatás esetében a MongoDB adatbázis mellett döntöttem az adatok tárolását illetően. Ennek főbb oka a NoSQL adatbázisok által nyújtott kiváló teljesítmény és skálázási potenciál, szemben a hagyományos SQL adatbázisokkal szemben, amit például a Keycloak használ. Abban az esetben, figyelembe véve a tárolandó adatokat, nem okoz teljesítménybeli problémát az adatszerkezet relációs reprezentációja.

Egy kisebb hátránya a NoSQL adatbázisoknak, hogy objektumorientált nyelvekben nincs olyan kifejlett támogatásuk, például nem áll hozzájuk rendelkezésre ```ORM```. A NoSQL adatbázis készítőjének kezelőjét(driverjét) kell hozzá használni. Annak érdekében, hogy ```Repository``` mintát alkalmazni tudjam, készítettem el a ```MongoDAL``` modult, ami tartalmazza az ehhez szükséges osztályokat és konfigurációkat. Ez a modul mind a 4 szolgáltatásnak függősége, ezt használják az adatbázissal való kommunikációhoz. A könnyebb bővíthetőséget szem előtt tartva ezt a modult egyrészt generikusként írtam meg, másrészt definiáltam egy interfészt minden szolgáltatásban, amelyek kiegészítésével újabb adatbázis műveleteket lehet hozzáadni a szolgáltatások ```Data Access Layer```-jéhez.

### Tranziens hibák kezelése
Megvizsgálva a kapcsolatot a projekteket kezelő szolgáltatások között, látható, hogy bizonyos szintű kommunikációra szükség lenne közöttük a konzinsztencia megőrzése érdekében. Fontos tisztázni, hogy a mikroszolgáltatás architektúránál, mivel bármelyik szolgáltatás kieshet, ezért csak esetleges konzisztencia valósítható meg. Éppen ezért szükséges olyan könyvtárak használata, melyek képesek kezelni az egyes szolgáltatások kiesését. Ilyen a *.NET*-es alkalmazásokhoz a *Polly* programkönyvtár, melyet én is használok a szoftveremben. Segítségével több policy-t egymásba lehet láncolni, mint a ```Circuit Breaker```, a ```Retry``` és a ```Fallback```. A ```Retry``` biztosítja, hogy többször újra tudjuk indítani a kérést, míg a ```Circuit Breaker``` lehetővé teszi azt, hogy ne terheljük túl a szükséges szolgáltatást. Ha pedig végképp nem tudjuk elérni a leállt mikroszolgáltatást, ezt le tudjuk kezelni a ```Fallback``` policy-vel. Ezt a 3 policy-t alkalmaztam én is a **projekteket** kezelő szolgáltatásban.

### Fejlesztés alatt
A *Polly* programkönyvtár segítségével sikerült elérnem, hogy a szinkron kommunikációt igénylő szolgáltatások közti kommunikáció megoldódjon, továbbá, hogy ellenálljon az egyes szolgáltatások kiesésének. Viszont olyan események, mint egy projekt törlése nem igényel szinkron kommunikációt, elég csak aszinkron módon értesíteni jelenesetben a **megbeszéléseket** és a **feladatokat** kezelő mikroszolgáltatást. Ehhez pedig ideális a *RabbitMQ* használata, mely lehetővé teszi az üzenetsor alapú kommunikációt.

## Értesítő szolgáltatás
Ahogy az architektúra tervnél már említettem ez egy *Go* nyelven írt program, mely 2 funkcióval rendelkezik. Az egyik, hogy fogadja az üzeneteket a többi projektkezelő szolgáltatástól, a másik, hogy ezeket az üzeneteket továbbítja e-mailben a felhasználók felé. Ennek következtében ez a szolgáltatás nem biztosít REST-es végpontot. Az üzenetek fogadása aszinkron módon, vagyis a többi szolgáltatás nem várja meg, míg kap visszacsatolást az e-mail küldés sikerességéről. Ezt a kommunikációt a *RabbitMQ* megoldásával valósítottam meg. Annak érdekében, hogy ne kelljen külön *SMTP* szervert használnom, a *SendGrid* e-mail küldő szolgáltatását. Ehhez létre kellett hoznom egy küldő entitást, mely megjelenik a kiküldött e-mailekben. Továbbá a szolgáltatás használatához szükségem volt egy API kulcsra, melyet az **értesítő** szolgáltatás környezeti változóként kap meg. Jelenleg új projekt létrehozásakor kap értesítést a létrehozó, hogy létrejött a projekt.

A szolgáltatás elkészítésénél az egyik legnagyobb probléma az volt, hogy a *GO* nyelvhez készített *RabbitMQ* kliens könyvtár nem támogatja az újra csatalakozást, vagyis a szolgáltatásokból kieséséből eredő problémák kezelésést. Ennek megoldásához találtam a [go-rabbitmq](https://github.com/wagslane/go-rabbitmq) programkönyvtárat, ami az alap *RabbitMQ* klienst egészíti ki a szükséges funkciókkal. A végső megoldásban ezt használtam.

## React Frontend
A mikroszolgáltatások összefogása érdekében készítettem egy webes felhasználói felületet, melynek feladata, hogy egy egységes felületet biztosítson a projektek kezeléséhez. A felhasználói felületet ```Single Page Application```-ként készítettem el a *React* keretrendszer segítségével. Ennek megfelelően az egyes funkcionalitásokhoz tartozó felületet komponensként hoztam létre, és nem egy teljesen új oldalként.

### Felhasználói felület
A UI tervezése során arra törekedtem, hogy egy letisztult, modern felültet biztosítson a rendszer, melynek használata kényelmes a felhasználók számára. Ennek érdekében merítettem ötleteket több már piacon lévő projektmenedzser alkalmazásból, mint például a *Trello* vagy a *Jira*. Így amellett döntöttem, hogy a projekteken belüli feladatok állapotának vizualizálásához egy kanban táblát fogok használni.

<p align="center">
<img src="resources/frontend_kanban.png" alt="Frontend kanban"/>
</p>

A tábla elkészítése mellett megoldottam, hogy az egyes elemeket *Drag&Drop* módon át lehessen rakni egyik oszlopból a másikba. Annyi megkötés van jelenleg a táblára vonatkozóan, hogy nem lehet más oszlopokat felvenni, hanem a feladatokat fixen 3 csoportba lehet sorolni. Vagyis vannak az elvégzendő, a folyamatban lévő és a befejezett feladatok. Ezen a felületen keresztül lehetőség van a már létező feladatok részleteinek megtekintésére, és törlésésre is.

<p align="center">
<img src="resources/comment_page.png" alt="Frontend kanban"/>
</p>

A feladat részletei mellett, a projekt résztvevőinek lehetősége van megbeszélni az adott feladattal kapcsolatos kérdéseket. Ezt teszi lehetővé a klasszikus üzenetkezelő alkalmazásokban megszokott felület.

A felhasználóknak természetesen lehetőségük van böngészni a projektjeik között, ehhez nyújt segítséget a projekteket listázó komponens.

<p align="center">
<img src="resources/project_list.png" alt="Projekt lista"/>
</p>

Ezen a felületen van lehetősége a projektgazdáknak szerkeszteni az egyes projekteket. Módosíthatják a projektek nevét, és hozzárendelt felhasználók listáját. Továbbá törölhetik is a projekteket, ha arra már nincs szükség. Természetesen ez csak a projektgazdákra igaz, a többi felhasználónak ehhez nincs jogosultsága.

<p>
<img src="resources/calendar_page.png" alt="Projekt lista"/>
</p>

Mindezek mellett a találkozók beütemezését is lehetővé teszi a weboldal. Ehhez egy naptárnézetet biztosítottam a felhasználók számára. Ezen belül létrehozhatnak új eseményeket, böngészhetnek az események között és természetes szerkesztehetik is őket. Szerkesztésre kiváló ok, hogy utólag az esemény résztvevői kiegészíthetik az eseményeket a megbeszélésen elhangzott hasznos információkkal.

### Adatok lekérdezése
Önmagában a UI mit sem érne az egyes mikroszolgáltatások által nyújtott funkcionalitás nélkül. Ezek eléséréshez a *Flux* mintát használtam, mely az egyirányú adatáramlásra megvalósítására biztosít egy megoldást. Három fontos komponensből épül fel:
- action
- dispatcher
- store.

<p align="center">
<img src="resources/flux_flow.png" alt="Flux ábra"/>
</p>

Az **action** komponens feladata, hogy kezelje a *React* komponensekben bekövetkező eseményeket. Én a projektben több **action** komponenst is létrehoztam, melyeket az egyes szolgáltatások alapján neveztem el. Ebből következik, hogy ezek feladata az adatok lekérése az egyes szolgáltatásoktól, továbbá a módosító események továbbítása. A backenddel való kommunikációhoz az *Axios* csomagot használtam, mely lehetővé teszi az aszinkron kérések küldését a *Javascript Promise API*-ja segítségével. A lekérés eredményét ennek megfelelően egy *Promise* objektum tartalmazza, mely az ```Active Object``` mintát valósítja meg. Ez a komponens felel a kérés eredményének átalakításáért és továbbításáért a **dispatcher** segítségével. Annak érdekében, hogy a **store** komponensek el tudják dönteni, hogy milyen **action** eredményét kapták meg, **action** konstansokat hoztam létre, és ezeket hozzáadom a **dispatcher** felé továbbított adathoz.

A **dispatcher** komponens az egyetlen, melyet a projektben használt *Flux* csomag biztosít. Ennek feladata lényegében az, hogy az **action** komponenstől kapott adattal meghívja az összes regisztrált callback függvényt. Vagyis, ahogy a neve is mutatja, biztosítja az összeköttetést  az **action** és a **store** komponensek között. Ebből a komponensből mindig csak egy példány létezik, tehát ez egy ```singleton```.

A megjelenítés szempontjából a legfontosabb komponens a **store**. Az egyes *React* komponensek ebből nyerik ki a megjelenítendő adatokat. Lényegében ez egy *EventEmitter*, ami a **dispatcher**-nél regisztrál egy callback függvényt. Ebben a belső állapotának módosítása után jelzi, hogy változás történt, amit a regisztrált *React* komponensek érzékelnek, és frissítik az állapotukat. Lényegében a **store** egy központi állapotot reprezentál az alkalmazáson belül. A **store** komponensek számát illetően több megközelítés is létezik, lehet ezt is ```singleton```-ként használni, de lehet domainenként külön **store**-t létrehozni. Én az utóbbi mellett döntöttem, mivel így jobban el vannak szeparálva egymástól az egyes szolgáltatásoktól érkező adatok, továbbá a *React* komponenseknek is elég csak a számukra lényeges **store** változására reagálniuk.

### Authentikáció
Korábbi fejezetben ismertetett authentikációs folyamatot meg kellett valósítanom a frontenden is. Ezt úgy oldattam meg, hogy a felhasználói felületen csak a **welcome** komponens érhető el bejelentkezés nélkül. Ha a felhasználó valamelyik másik komponensre szeretne váltani, akkor automatikusan át lesz irányítva a bejelentkeztető komponensre. Ha a bejelentkezés sikeres, akkor a **user action** komponens eltárolja a kapott *JWT* tokent a *Local Storge*-ban. Egy másik megközelítés az is lehetne, hogy a *Session Storage*-ban tárolom a tokent, viszont ebben az esetben a böngésző bezárása után újra be kell jelentkeznie. Tehát az általam választott megoldással csökkenteni tudtam a szükséges bejelentkezések számát, a token egészen a benne foglalt lejárati dátumig használható. Azt, hogy a bejelentkezés megtörtént-e, a komponens betöltésekor vizsgálom meg úgy, hogy ellenőrzöm a token meglétét a *Local Storage*-ban. 

### Komponensek közötti váltás
Mivel a frontend egy ```SPA```, ezért az oldalak közötti váltást nem a teljes oldal betöltésével történik, hanem csak a megjelenített komponens kerül kicserélésre. Ehhez a *React* keretrendszer biztosít megoldást, aminek a neve *React Router*. Ez lényegében úgy működik, hogy az URL útvonal komponense alapján határozza meg az alkalmazás, hogy melyik komponenst kellene betölteni. Az útvonalaknál igyekeztem beszédes neveket adni, példaként a regisztrációs felület a **/register**, a projektek listája pedig a **/projects** útvonalon érhető el. Abban az esetben, hogyha valamelyik specifikus projekthez tartozó információkat kell betölteni az oldalnak, akkor az útvonal komponens tartalmazza az adott objektum azonosítóját. Tehát például az 1-es azonosítóval rendelkező projekt részletei a **/projects/project/1** útvonalon érhetők el. Egy másik megoldást is vizsgáltam ezzel kapcsolatban. Ami úgy működött volna, hogy egy külön **store** komponensben eltárolom, hogy melyik projektet szeretnénk aktuálisan megnyitni. Viszont ez nem volt jó megoldás, akkor amikor az oldal újratöltődött, mert ilyenkor elveszett ez az információ. Ezért döntöttem végül amellett, hogy magában a path-ban adom meg a projekt azonosítóját, így újratöltéskor is be tudja tölteni az alkalmazás a megfelelő információkat.

Egy érdekes feladat volt még annak a megoldása, hogy amikor a felhasználó nincs bejelentkezve, és például a projekt listát betöltő komponenst szeretné elérni, akkor átirányításra kerül a bejelentkeztető oldalra. Viszont ilyenkor célszerű lenne bejelentkezés után egyből a kívánt oldalra irányítani. Ehhez végül pont azt a korábban említett megoldást választottam, hogy a **user store**-ban tárolom el a kiinduló oldal címét. Így a sikeres bejelentkezés után vissza tudom irányítani a felhasználót a megfelelő oldalra. Itt is problémát jelenthet az, hogy az újratöltéskor ez az információ elvész, viszont ennek az esetnek a kezelését nem tartottam annyira lényegesnek. 

### Azonalli üzenetkezelés
A felhasználói felületet bemutató részben már említettem, hogy a felhasználóknak lehetőségük van kommenteket írnia az egyes feladatokhoz. Ahhoz, hogy valósidejű kommunikáció áljon a rendlekezésükre a *SiganlR* programkönyvtárat használtam. Ennek a nagy erőssége, hogy a *WebSocket* mellett támogatja a ```long polling```-ot is, ezek között dinamikusan ki tudja választani, hogy melyik áll éppen rendelkezésre az adott kliens viszonylatában. Ahhoz, hogy ez működjön a **kommenteket kezelő** szolgáltatást is módosítanom kellett. Úgy oldottam meg, hogy a kliensek nem közvetelenül kapják meg az új üzenetet, hanem a csak értesítést kapnak arról, hogy frissítsék a rendelkezésükre álló kommentek listáját. Tovább az üzenetek nem a SiganlR Hubnak küldik, hanem a REST-es interfésznek, és az értesíti a Hub-ot, hogy értesítse a klienseket. Erre azért volt szükség, mert a *WebSocket* nem garantálja, hogy az üzenet megérkezik a csatlakozott kliensekhez vagy éppen a szerverhez. Továbbá így egységesebben lehetett implementálni a **kommenteket kezelő** szolgáltatással történő kommunikációt, hiszen elég csak REST-es kéréseket használni. 

### Fejlesztés alatt
Az webalkalmazás biztosítani fog egy profil oldalt is, ahol az aktuális névről, a megadott e-mail címről és egyéb adatokról lehet majd informálódni. Természetesen ezek módosítására is lesz lehetőség, kiemelt figyelemmel az e-mail címekre, hiszen ezen keresztül kaphatnak majd tájékoztatást a fontos projektbeli változásokról.

## Konténerizáció
### Docker
A fejlesztés során fontos szempont volt, hogy az egyes szolgáltatások telepítése könnyen, gyorsan megvalósulhasson. Ennek érdekében mindegyik szolgáltatáshoz biztosítottam annak lehetőségét, hogy *Docker* konténerben futtatható legyen. Ez egy olyan virtualizációs megoldás, mely kompakt módon, a host operációs rendszer kernelét használva biztosít egy korlátozott funkcionalitással rendelkező Linux operációs rendszert. Így garantálni tudjuk, hogy a szoftverünk mindig a megfelelő környezetben fusson. (Manapság már lehetőség van Windows alapú Docker konténereket is futtatni, viszont ezek csak Windows operációs rendszeren használhatók a korábban említett kernel függőség miatt.)
 
Első lépésként készítettem *Dockerfile*-t minden egyes komponenshez, melyek *Docker image* elkészítéshez használhatók. Ezen fájlok írásánál a többlépcsős build-elést preferáltam, annak érdekében, hogy a végső képfájlok a lehető legkompaktabbak legyen. Ez annyit tesz, hogy külön konténerben fordítom le az egyes szoftvereket és a végső képfájlba csak a ténylegesen szükséges fájlok kerülnek bele.

A *Dockerfile*-ok elkészítésével már elértem, hogy a szolgáltatások egyenként futtahatók legyenek. Annak érdekében, hogy a teljes rendszer felállítható legyen annak minden függőségével együtt, a *Docker Compose* eszközt használtam. A szükséges szolgáltatásokat specifikáltam egy *YAML* fájlban, amit a *Docker Compose* konfigurációs fájlként használ. Ezek után az egész rendszer felállítható pár parancs segítségével.

### Kubernetes
Éles környezetben több igény is felmerülhet, melynek megoldása nem oldható meg könnyen *Docker Compose* használatával. Szükség lehet szolgáltatások replikációjára a terhelés elosztása érdekében, a hibás konténerek újraindítására, továbbá a felindított konténerek frissítésének és konfigurálásának kezelésére. Ezen igények kielégítése érdekében érdemes használni konténer *orchestratort*, mint például a *Kubernetes* vagy a *Docker Swarm*. Én a projektemhez az előbbit választottam, ugyanis az egyik legelterjedtebb megoldás.

Ahhoz, hogy a szoftver felinditható legyen *Kubernetes* klaszterben, el kellett készítenem több konfigurációs fájlt is a szolgáltatásaimhoz. Az első a *Deployment* konfiguirációs fájlok elkészítése volt. Ez lényegében adott szolgáltatás kívánt állapotát határozza meg, és ezen keresztül lehet frissíteni a szolgáltatásokat. A háttérben *ReplicaSet*-et és azon belül *Pod*-okat hoz létre. A *ReplicaSet* határozza meg, hogy az egyes szolgáltatásokból hány replika,*Pod* induljon el, és ezt a számot folyamatosan igyakszik tartani. Ha az egyik pod leáll, akkor azonnal indít egy újat. A *Pod* áll a legközelebb ahhoz, amit klasszikus *Docker* konténerekhez. De egy *Pod*-ban több konténer is futtatható. A megoldásomban az egy szolgáltatás, egy *Pod* javasolt megközelítést követtem. Ahhoz, hogy a szolgáltatás elérhető legyen a klaszteren belül, szükség van egy *Service* definiálására is. Ebben határozzuk meg, hogy milyen hoszt néven, és milyen portokon érhető el az adott szolgáltatás. Végezetül pedig, azon szolgáltatások esetén, melyet ki kell engednem az *API Gatewayen* keresztül, egy *Ingress*-t is meg kellett határozni. Ebben adtam meg, hogy mely URL útvonalakat írányitsa a *Traefik* az adott szolgáltatás adott portjához.



### Szolgáltatások konfigurálása
Az egyes komponensek tervezésekor külön figyelmet fordítottam arra, hogy a lehető legtöbb paraméter konfigurációs fájlból módosítható legyen. Például lehetőség van szolgáltatásoknál beállítani az adatbázis URL-t, az adatbázis használatához szükséges hitelesítő adatokat, vagy éppen az adatbázis nevét. Ezen kívül a ```JWT``` generáláshoz szükséges titkos bájtsorozat is konfigurálható. Ezeket a paramétereket mind úgy terveztem, hogy ne csak egy konfigurációs fájlból lehessen őket beállítani, hanem környezeti változókkal is. Ezt a megoldást alkalmaztam a ```docker-compose.yml``` fájlban is, mely tartalmazza az összes konfigurálható paramétert, amiket a MicroProject alkalmazás komponensei biztosítanak. Ezen kívül az ismétlődő értékek másolgatásának elkerülése végett létrehoztam egy ```.env``` fájlt is. Az ebben definiált környezeti változók értékei felhasználhatók a ```docker-compose.yml``` fájlban. 

## Összegzés
A MicroProject projektmenedzser alkalmazás fejlesztése során a mikroszolgáltatás architektúrával ismerkedtem meg. Első lépésként megterveztem, hogy milyen szolgáltatásokra lesz szükség a funkcionalitás biztosítása érdekében. Ehhez a ```Domain Driven Design``` megközelítést követtem. A tervek alapján sikeresen elkészítettem az alkalmazás **projekt**, **feladat**, **hozzászólás** és **találkozó** szolgáltatásait. A **projekt** és a **feladat** szolgáltatások bizonyos funkcióit elérhetővé tettem egy *React* alkalmazás formájában, melynek kibővítésével az összes szolgáltatás elérhető lesz a jövőben. 

Az **authentikációs** szolgáltatás elkészítésével megoldottam, hogy ne férjen hozzá bárki a projektekkel kapcsolatos adatokhoz. Ehhez segítségemre volt a *Traefik* API Gateway megoldása, mely amellett, hogy egy egységes interfészt biztosított az egyes szolgáltatások eléréséhez, lehetőséget adott arra, hogy egy authentikációs middleware-t adjak hozzá a védeni kívánt végpontokhoz.

A szolgáltatások könnyebb telepítése érdekében pedig megoldottam, hogy az egész alkalmazás *Docker* konténerekben futhasson. Az egyes szolgáltatások felindításához pedig a *Docker Compose* eszközt használtam, mely megkönnyítette a konténerek paraméterezését, kiváltképpen a *Traefik* használatát.