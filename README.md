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

* **Pasek zdrowia:** Animowane serca paska życia reagujące na zmiany zdrowia stanami utraty (`.lost`) i uleczenia (`.healed`).
* **Regulacja głośności:** Paski głośności renderowane za pomocą segmentów kostnych (10 stopni skali).
* **System komunikatów:** Tekst dialogów i interakcji wyświetlany z prędkością 40ms na znak, z blokadą przypadkowego przeklikania (`preventClickThrough`).
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


---
## **Interfejs i Oprawa (UI/UX)**

### **User Interface**

Przejrzysty panel informacyjny dostarcza graczowi kluczowych danych:

* Wizualny pasek zdrowia oraz licznik obecnego poziomu.
* Podgląd posiadanego ekwipunku.
* System powiadomień informujący o sukcesach (rozwiązanie zagadki, zwycięstwo) lub błędach.

### **Grafika i Warstwa Audio**

* **Estetyka:** Jednolita i czytelna oprawa wizualna, zoptymalizowana pod kątem płynności działania.
* **Dźwięk:** 


### Czas Wykonania Projektu: Od 10.04.2026 do 08.06.2026
## Autorzy: Kirill Siarchenia | Nathaniel Kusal 2P
