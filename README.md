# Eyes of the Abyss
Gra, w której przemierzasz mroczne labirynty pełne pułapek i ukrytych przejść. Twoim celem jest odnalezienie wyjścia, rozwiązując zagadki i unikając niebezpieczeństw czających się w ciemności. Każdy poziom to nowe wyzwanie i coraz większe napięcie.

## **Opis Gry**

Głównym zadaniem gracza jest nawigacja przez labirynt w celu odnalezienia wyjścia. Rozgrywka łączy w sobie elementy eksploracji, strategii oraz zręczności. Aby odnieść sukces, użytkownik musi:

* Odkrywać nieznane obszary mapy.
* Gromadzić niezbędne wyposażenie oraz klucze otwierające przejścia.
* Stawiać czoła przeciwnikom i łamigłówkom.
* Wykazywać się refleksem, omijając przeciwników i pułapki.
* Monitorować wskaźnik żywotności (HP), aby uniknąć śmierci.

Wraz z postępem w grze poziom trudności rośnie – labirynty stają się rozleglejsze, a pułapki i zagadki wymagają coraz większego skupienia.

---

## **Wykorzystane Technologie**

Aplikacja została zbudowana w oparciu o nowoczesne standardy webowe, co pozwala na jej uruchomienie w dowolnej przeglądarce bez konieczności instalacji:

* **HTML5** wraz z elementem **Canvas** do renderowania dynamicznej grafiki dwuwymiarowej.
* **CSS3** do stylizacji elementów interfejsu użytkownika, menu oraz animacji przejść.
* **JavaScript (ES6+)** jako obiektowy silnik logiki gry.
* **Web Audio API** do zaawansowanej obsługi efektów dźwiękowych i przestrzennego audio.

---

## **Kluczowe Mechaniki**

### **1. System Ruchu i Nawigacji**

* **Intuicyjne sterowanie:** Obsługa za pomocą sekcji `WASD` lub strzałek kierunkowych.
* **Silnik kolizji:** Postać płynnie porusza się wewnątrz korytarzy, reagując na ściany i zablokowane przejścia.
* **Struktura Gridu:** Świat gry oparty jest na siatce kafelków o rozmiarze 90x90 pikseli, co zapewnia precyzyjne rozmieszczenie obiektów.
* **Mechanika biegu:** Przytrzymanie klawisza `Shift` pozwala na szybsze poruszanie się, jednak generuje hałas przyciągający przeciwników.
* **Płynna kamera:** System śledzenia gracza z martwą strefą (300x200 pikseli), zaokrąglający pozycję przesunięcia (`Math.floor`) w celu wyeliminowania rozmycia pikseli.
* **Dynamiczna mgła wojny:** Radialny gradient generujący ciemność wokół gracza na wyższym poziomie trudności, ograniczając pole widzenia.

### **2. Pokoje z Zagadkami (Tryb ROOM)**

* **Widok panoramiczny:** Po wejściu do pokoju gra przechodzi w tryb Point-and-Click z nawigacją panoramiczną (Lewo, Środek, Prawo) za pomocą strzałek na ekranie.
* **Dynamiczny kursor:** Wybrany z ekwipunku przedmiot zastępuje systemowy kursor myszy, wskazując gotowość do interakcji z otoczeniem.
* **Przedmioty:**
    * Kamień — służy do rozbijania skrzyń lub blokowania kół zębatych.
    * Rubin — element umieszczanн w oczodołach posągu.
    * I inne.

### **3. Przeciwnicy i Przetrwanie**

* **Sztuczna inteligencja:** Przeciwnicy patrolują wyznaczone ścieżki i szukają gracza za pomocą algorytmu A*.
* **Zmysły wzroku i słuchu:** Reakcja na pojawienie się gracza w linii wzroku lub na dźwięk kroków podczas biegu.
* **Trójfazowe poszukiwanie:** Po utracie kontaktu potwór idzie do ostatniej pozycji gracza, wykonuje ruch z bezwładnością (`inertia`) do najbliższego skrzyżowania, a następnie rozgląda się na boki.
* **Unikanie zablokowania:** Jeśli przeciwnicy zablokują się w korytarzu na dłużej niż 2.5 sekundy, potwór automatycznie koryguje swoją trasę.
* **Zarządzanie HP:** Każdy kontakt z zagrożeniem odbiera 1 HP. Gracz otrzymuje sekundę niewrażliwości (miganie postaci), a na ekranie pojawia się animacja uderzenia. Wyzerowanie HP kończy się ekranem „Game Over”.

### **4. System Poziomów**

* **Poziom 1 (Etap Wstępny):** Zapoznanie z ruchem, wprowadzenie do gry.
* **Poziom 2 (Etap Średni):** Trudniejsze zagadki, patrolujący wrogowie.
* **Poziom 3 (Etap Zaawansowany):** Duża mapa z zaawansowaną zagadką i dużą ilością wrogów.
* **Poziom 4 (Epilog):** Specjalny poziom fabularny.

---

## **Interfejs i Oprawa (UI/UX)**

### **User Interface**

* **Pasek zdrowia:** Animowane serca paska życia reagujące na zmiany zdrowia stanami utraty i uleczenia.
* **Regulacja głośności:** Paski głośności renderowane za pomocą segmentów(10 stopni skali).
* **System komunikatów:** Tekst dialogów i interakcji wyświetlany z prędkością 40ms na znak, z blokadą przypadkowego przeklikania.
* **Pauza systemowa:** Wyjście z trybu pełnoekranowego automatycznie zatrzymuje rozgrywkę i wywołuje menu przywracania ekranu.

### **Grafika i Warstwa Audio**

* **Estetyka:** Spójna i czytelna oprawa wizualna pixel-art zoptymalizowana pod kątem płynności działania.
* **Audio oparte na odległości:** Dźwięki kroków potwora wyciszają się na podstawie odległości euklidesowej od gracza.
* **Efekt stłumienia:** Automatyczne przygłuszanie częstotliwości muzyki tła na pauzie i przy braku ostrości okna.
* **Płynność dźwięku:** Bezpieczne nakładanie się dźwięków dzięki dynamicznemu klonowaniu węzłów audio.

---

## **Uruchomienie Projektu**

Gra została wdrożona i jest dostępna bezpośrednio w przeglądarce internetowej. Nie wymaga klonowania repozytorium ani lokalnej instalacji.

Możesz uruchomić grę i od razu zacząć rozgrywkę pod poniższym adresem:
👉 **[Zagraj w Eyes of the Abyss na GitHub Pages](https://kirillsiarchenia.github.io/ZEGgame/game/)**


## **Podział ról w zespole**

| Rola | Odpowiedzialność | Członek zespołu |
| :--- | :--- | :--- |
| **Lead Developer & JS Developer** | Projektowanie i implementacja silnika gry, programowanie AI wrogów (algorytm A*), silnik zderzeń, system kamer z martwą strefą, dynamiczna mgła wojny, integracja systemu Audio, zarządzanie stanami gry, lokalizacja językowa. | **Kirill Siarchenia** |
| **Graphic Designer** | Tworzenie oprawy graficznej pixel-art (sprajty postaci, elementy tła,)| **Nathaniel Kusal 2P** |

---

## **Zarządzanie projektem**

* **Metodyka:** Kanban oparty o tablicę zadań Trello do monitorowania postępów i sprawnej organizacji pracy zespołu.
* **Kontrola wersji:** System Git oraz repozytorium GitHub do sprawnego scalania kodu i automatycznego wdrażania stabilnej wersji za pomocą usługi GitHub Pages.
* **Etapy realizacji:**
  1. *Analiza:* Ustalenie mechaniki siatki (grid 90x90) oraz założeń projektowych.
  2. *Projektowanie:* Przygotowywanie arkuszy sprajtów, szkicowanie UI i projektowanie struktury 4 poziomów.
  3. *Implementacja:* Kodowanie logiki ruchu, mechaniki Point-and-Click w pokojach zagadek oraz maszyny stanów AI przeciwnika.
  4. *Testowanie i wdrożenie:* Optymalizacja działania audio, usuwanie błędów kolizji oraz wdrożenie stabilnej wersji gry online.

---

## **Testowanie**

W ramach kontroli jakości przeprowadzono manualne oraz integracyjne testy następujących funkcjonalności:

* **Kolizje i fizyka ruchu:** Zweryfikowano zachowanie sprajtu gracza na granicach ścian na każdym z poziomów. Przetestowano zaokrąglanie przesunięć kamery za pomocą `Math.floor`, co zapobiega rozmywaniu pikseli.
* **Sztuczna inteligencja przeciwników (AI):** Przetestowano przechodzenie wrogów przez stany `patrol`, `chase` oraz `searching` (ruch bezwładny, rozglądanie się). Zweryfikowano działanie korekty trasy po 2.5 sekundy blokowania się potworów w wąskich przejściach.
* **Zarządzanie zdrowiem:** Sprawdzono poprawne naliczanie obrażeń, odrzut (knockback), sekundy niewrażliwości (miganie postaci) oraz synchronizację efektów wizualnych i dźwiękowych.
* **Interakcja z obiektami w pokojach (ROOM):** Przetestowano pełną ścieżkę interakcji ze wszystkimi przedmiotami.
* **UI/UX i Dźwięk:** Przetestowano automatyczne wstrzymanie rozgrywki po wyjściu z trybu pełnoekranowego. Zweryfikowano euklidesowe wyciszanie kroków potwora oraz tłumienie pasma muzyki tła przy pauzie.

---

## **Możliwości rozwoju**

Architektura silnika gry została zaprojektowana w oparciu o elastyczne struktury danych (podejście *data-driven*). Dzięki oddzieleniu logiki kodu od konfiguracji zasobów, gra oferuje przejrzyste możliwości rozbudowy bezpośrednio w istniejących plikach źródłowych:

* **Proste dodawanie przedmiotów i interakcji:** Wszystkie przedmioty w grze są zdefiniowane w centralnym rejestrze `ObjectsLibrary`. Dodanie nowego przedmiotu (użytkowego lub fabularnego) wymaga jedynie dopisania klucza ze sprajtem i opcjonalnej funkcji zwrotnej `action`, bez modyfikowania kodu odpowiedzialnego za ekwipunek.
* **Rozszerzanie lokalizacji językowej:** Gra wspiera dynamiczne przełączanie języków w locie. Dodanie nowego języka (np. niemieckiego) sprowadza się do stworzenia słownika tłumaczeń analogicznego do `langPL` i dopisania go do obiektu `allLanguages` w pliku głównym.
* **Wdrażanie efektów audio i muzyki:** Rejestracja zasobów dźwiękowych w `SoundManager.js` opiera się na prostym mapowaniu klucz-wartość w obiektach `soundFiles` (dla SFX) oraz `ambientFiles` (dla muzyki tła). Nowe efekty audio wymagają jedynie umieszczenia pliku w katalogu i dodania wpisu do rejestru inicjalizacyjnego.
* **Szybkie tworzenie map i pokojów zagadek:** 
  * Labirynty są przechowywane w postaci czytelnych tablic dwuwymiarowych w obiekcie `maps` (plik `maps.js`).
  * Zawartość pokojów Point-and-Click, ich graficzne tła oraz położenie obiektów w trzech perspektywach (lewo, środek, prawo) konfiguruje się deklaratywnie w obiekcie `INITIAL_ROOMS_DATA` (plik `RoomsData.js`).
* **Zarządzanie rozmieszczeniem potworów i skarbów:** Pliki konfiguracyjne `enemiesData.js` oraz `mazeItemsData.js` pozwalają na swobodne dodawanie nowych wrogów (wraz z ich ścieżkami patrolowymi) oraz przedmiotów na planszy bez ingerencji w skrypty zachowań potworów czy gracza.

---

### **Wymagania techniczne**
* Dowolna nowoczesna przeglądarka internetowa wspierająca specyfikację **HTML5 Canvas**, **CSS3** oraz **Web Audio API**. Gra działa płynnie przy 60 FPS i nie wymaga pobierania zewnętrznych bibliotek ani frameworków.


### Czas Wykonania Projektu: Od 10.04.2026 do 08.06.2026
## Autorzy: Kirill Siarchenia | Nathaniel Kusal 2P
