# MicroProject projektkezelő alkalmazás
**Fürjes-Benke Péter**

## Feladat leírása
A cél egy projektkezelő alkalmazás készítése volt, mely mikroszoláltatásokból épül fel. Az egyes szolgáltatások Docker konténerben futtathatóak, és a funkcionalitásuk csak egy API gateway-en keresztül érhető el a külvilág számára. Mikroszolgáltatás architektúráról lévén szó, az egyes szolgáltatásoknak egymástól függetlenül működőképesnek kell maradniuk. Ennek értelmében a rendszernek ellen kell állnia a tranziens hibáknak.

### Funckioanlitás részletes leírása
A programnak képesnek kell lennie projektek kezelésére, azon belül a feladatok állapotának nyomonkövetésére. A közös munka megkönnyítése érdekében a felhasználók az egyes feladatok alatt kommenteket írhatnak a haladásukról, vagy éppen javaslatokat tehetnek. Ezen felül a program lehetőséget ad találkozók létrehozására, mely bekerül a résztvevők naptárjába. A találkozókon elhangzott fontos információkról összefogalalókat lehet írni, mely a későbbiekben is visszanézhető. Emellett minden az adott projektben résztvevő értesítést kap a projektet érintő változásokról, mósoításokról a regisztrációkor megadott e-mail címükre.

## Architektúra terv
<center><img src="resources/project_manager.png" alt="drawing" height="450"/></center>

Az architektúra tervezése során a ```Domain Driven Design```-t követtem annak érdkében, hogy meghatározzam a szükséges mikroszolgáltatások körét. Ennek megfelelően összesen 5 alapvető szolgáltatásra bontottam fel az alkalmazást, melyek a ```polyglot``` elvet követve különböző programozási nyelven íródnak. A szolgáltatások elérésének biztosításáért a *Traefik API Gateway* felelős. Továbbá ezen keresztül érhető el az alkalmazás felhasználói felülete is. A szolgáltatások közötti üzenetsor alapú aszinkron kommunikációért pedig egy *RabbitMQ* példány felel.

### Authentikációs szolgáltatás
Egy *Spring Boot* keretrendszerben készített szolgáltatás, melynek feladata a felhasználók kezelése. Egy REST-es API-n keresztül biztosítja a regisztációhoz, a bejelentkezéshez és az azonosításhoz szükséges funkcionalitást. A felhasználók adatai egy *MySQL* adatbázisban kerülnek eltárolásra, melynek eléréshez egy repository-n keresztül történik, melyet a *Spring Data JPA* keretrendszer alapból biztosít. 

### Projekteket kezelő szolgáltatás
A komponenes egy *.Net* alapú alkalmazás, mely REST API-n keresztül biztosítja a projektek lértehozását, és azok kezelését. Az adatok strukjtúrájához igazodva ebben az esetben már egy dokumentum alapú *MongoDB* adatbázisban kerülnek eltárolásra a szükséges információk. Az adatbázis elérése ebben az esetben is a ```repository``` mintának megfelelően egy burkoló osztállyal történik.

### Feladatokat kezelő szolgáltatás
A projekteken belül feladatokat lehet létrehozni. Ezek létrehozásáért és kezelésért felel ez a szolgáltatás. A funkciókat REST API-n keresztől biztosítja a projektkezelő alkalmazáshoz hasonlóan. Ez esetben is a ```repository``` mintát követi a komponens architektúrája, mely egy *.Net 5* alkalmazásban lett implementálva és maguk az adatok pedig egy *MongoDB* adatbázisban tárolódnak.

### Megbeszéléseket kezelő szolgáltatás
Ennek a komponesnek a feladat az egyes proktekhez tartozó megbeszélések létrehozásáért, és azok kezeléséért felelős funkciók biztosítása. A projekt szoláltatásnak hasonlóan ez is egy *.Net* alkalmazás és az adatok *MongoDB*-ben tárolódnak.

### Hozzászólásokat kezelő szolgáltatás
A feladat leírásának megfelelően a felhasználóknak lehetősége van kommenteket írni az egyes feladatokhoz. Az ehhez szükséges funkciók biztosítása a feladata ennek a szolgáltatásnak. Ez a szolgáltatás is egy *.Net 5* alkalmazás, mely *MongoDB*-ben tárolja a hozzászólásokat.

### Értesítő szolgáltatás
Ez a *Go* nyelven írt szolgáltatás felel azért, hogy értesítse a felhasználókat abban az esetben, ha valamelyik projektjükben változás történt. Mivel ehhez mindegyik korábbi szolgáltatással kapcsolatban kell lennie, ezért egy üzenetsor alapú kommunikációt valósít meg a *RabbitMQ* segítségével. A megkapott üzeneteket pedig továbbítja e-mail-ben a felhasználóknak a *SendGrid API* segítségével.

### Webszerver
A webszerver feladata, hogy elérhetővé tegye a React keretrendszerben megírt weboldalt, mely - felhasználva a korábbi szolgáltatásokat - biztosítja a teljes rendszer funkcionalitását. Ez a szolgáltatás az *NGINX* webszerverrel lett megvalósítva.

## API gateway
A MicroProject alkalmazás több szolgáltatásból épül fel, és ezek mindegyik egy meghatározott REST interfészen keresztül publikálja a szolgáltatásait. Annak érdekében, hogy egy címen keresztül el lehessen érni az összes szolgáltatást egy API gatewayt használtam, azon belül is a *Traefik* megoldását, mely egyszerűen konfigurálható a  *docker-compose* konfigurációs fájljával együtt. A **docker-compose.yml** fájlban elég volt csak megadni a route-olási szabályokat az egyes szolgáltatásokhoz, amik alapján a Traefik pedig konfigurálja az elérési utakat. Ezek után már a frontend fejlesztésénél elég volt a Traefik által publikált címet, mint alap URL-t használni, és a kérések a megfelelő mikroszolgáltatáshoz irányítódnak.

Az egységes interfészen kívül még előnye az API Gateway használatának, hogy biztonságos *HTTPS* kapcsolatot elég csak kifelé biztosítani, a mögötte lévő szolgáltatások egyszerű *HTTP* protokollon kommunikálhatnak egymással. Továbbá a Traefik egyéb szolgáltatásokat is nyújt, mint például a ```Forward Authentication```, amelyről a következő fejezetben lesz szó.

## Felhasználó authentikáció
![Authentikáció ábra](resources/authentication_flow.png)
Annak érdekében, hogy szoftver rendelkezzen authentikációval, továbbá authorizációval, elkészítettem a felhasználókat kezelő mikroszolgáltatást. A rendszer ezt a szolgáltatást a ```Federated Identity``` minta szerint, mint authorizációs szerver használja. Ezt úgy értem el, hogy beállítottam a *Traefik* által biztosított ```Forward Auth Middleware```-ként a **felhasználó** szolgáltatást a védeni kívánt végpontokhoz. Így a *Traefik* már minden kérés előtt lekérdezi a **felhasználó** szolgáltatástól, hogy az adott felhasználó rendelkezik-e engedéllyel a többi szolgáltatás eléréséhez. Az engedély ebben az esetben azt jelenti, hogy a felhasználó redelkezik-e érvényes ```Json Web Token```-nel. Ha igen, akkor a *Traefik* továbbítja a kérést a megfelelő szolgáltatásnak, egyéb esetben pedig a felhasználót értesíti a hiba okáról.

Hiba esetén a felhaszálónak be kell jelentkeznie, vagy ha még nincs fiókja, akkor regisztrálni kell. Ha helyesen adta meg a hitelesítő adatait, akkor a **felhasználó** szolgáltatás generál egy új ```JWT``` tokent, melyben eltárolja az adott felhasználó azonosítóját, majd aláírja. Mivel minden genenerált token rendelkezik egy aláírással, amihez a titkot csak a **felhasználó** szolgáltatás ismeri, így biztosított, hogy a támadók kellően nehezen tudnak olyan tokent generálni, amit a szolgáltatás érvényesnek ítélne.

A *Spring Secuity* keretrendszer lehetőséget nyújt arra, hogy sztenderd OAuth authorizációt használjuk. Ez esetben a folyamat annyiban módosulna, hogy nem kellene külön lépésben bejelentkezni, hanem hiba esetén a **felhasználó** szolgáltatás átirányítana egy bejelentkeztető oldalra, amit a *Spring* keretrendszer alapból legenerál. Sikeres bejelentkezés esetén pedig a Traefik hozzáférést adna a többi szolgáltatáshoz. Ezt a megoldást nem sikerült egyelőre implementálnom, viszont a szükséges konfigurációs osztályokat létrehoztam már a **felhasználó** szolgáltatásban.

## Projektek kezelése
Ahogy az architektúra tervnél már ismertettem, a projektek kezelését 4 mikroszolgáltatásra osztottam. Ezek a domain szerint a következőek:
- projekt
- feladat
- hozzászólás
- megbeszélés

A **projekt** szolgáltatás felel a legfelsőbb szintű projekt objektumokért. Ezek tartalmazzák az adott projekt címét, létrehozóját és a tagokat, akik az adott projektben dolgoznak. A projekt szolgáltatásban implementáltam bizonyos fokú jogosultságkezelést. Vagyis egy projektet csak a projektgazda módosíthat, a tagoknak nincs ehhez joguk.

A projekteken belül tetszőleges mennyiségű feladat hozható létre, mely kezeléséért felel a **feladat** szolgáltatás. A feladatokhoz hozzá lehet rendelni felhasználókat, akiknek azt el kell végezni. Ezen felül lehet módosítani a feladat állapotát, annak érdekében, hogy nyomon lehessen követni a projekt előrehaladását. 

A felhasználóknak lehetősége van hozzászólásokat írni az egyes feladatokhoz, ezzel is könnyítve a közös munkát. Mivel domain szinten ez a funckionalitás is független a többitől, ezért kiszerveztem a megjegyzések kezelését a **hozzászólás** szolgáltatásba.

Mivel egy projekt során több konzultációra is szükség lehet a résztvevők között, ezért ennek kezelésére létrehoztam a **megbeszélés** szolgáltatást. A felhasználóknak lehetőségük van felvenni a megbeszéléseket, mint eseményeket, aminek van egy kezdő időpontja, továbbá azt is meg lehet határozni, hogy előreláthatólag meddig fog tartani. Továbbá lehetőség van arra is, hogy jegyzeteket rendeljenek az egyes megbeszélésekhez, így az elhangzott fontos információk később is elérhetőek központilag a rendszerben.

## React Frontend
## Összegzés
## Továbbfejlesztési lehetőségek