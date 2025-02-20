import requests
import sqlite3
import json
from bs4 import BeautifulSoup
import time

# URL страницы Википедии
URL = "https://en.wikipedia.org/wiki/List_of_highest-grossing_films"

# Получаем HTML страницы
response = requests.get(URL)
if response.status_code != 200:
    print("Ошибка запроса к Википедии:", response.status_code)
    exit()

soup = BeautifulSoup(response.text, "html.parser")

# Находим таблицу с фильмами
films_table = soup.find("table", class_="wikitable")
if not films_table:
    print("Ошибка: таблица не найдена!")
    exit()

rows = films_table.find_all("tr")[1:]  # Пропускаем заголовок

data = []

for row in rows:
    cols = row.find_all("td")
    if len(cols) < 5:
        continue

    title_tag = row.find("th", scope="row").find("a") if row.find("th", scope="row") else None
    if not title_tag:
        continue

    title = title_tag.get_text(strip=True)
    film_url = "https://en.wikipedia.org" + title_tag["href"]
    
    print(f"Парсим {title} -> {film_url}")

    try:
        # Получаем данные с отдельной страницы фильма
        film_response = requests.get(film_url)
        film_soup = BeautifulSoup(film_response.text, "html.parser")
        
        # Извлекаем год выпуска
        year_tag = film_soup.find("span", class_="bday")
        release_year = year_tag.get_text(strip=True) if year_tag else "Unknown"

        # Извлекаем режиссера
        director_tag = film_soup.find("th", string="Directed by")
        director = "Unknown"
        if director_tag:
            director_data = director_tag.find_next_sibling("td")
            if director_data:
                director = ", ".join([a.get_text(strip=True) for a in director_data.find_all("a")]) or director_data.get_text(strip=True)

        # Извлекаем кассовые сборы
        box_office_tag = film_soup.find("th", string="Box office")
        box_office = "Unknown"
        if box_office_tag:
            box_office_data = box_office_tag.find_next_sibling("td")
            box_office = box_office_data.get_text(strip=True) if box_office_data else "Unknown"

        # Извлекаем страну
        country_tag = film_soup.find("th", string="Country")
        country = "Unknown"
        if country_tag:
            country_data = country_tag.find_next_sibling("td")
            if country_data:
                country = ", ".join([a.get_text(strip=True) for a in country_data.find_all("a")]) or country_data.get_text(strip=True)

        print(f"Добавлен фильм: {title}, {release_year}, {director}, {box_office}, {country}\n")

        data.append((title, release_year, director, box_office, country))
    
    except Exception as e:
        print(f"Ошибка при обработке {title}: {e}")

    # Даем передышку серверу Википедии
    time.sleep(1)

# Проверяем, есть ли данные
if not data:
    print("Ошибка: данные о фильмах не были собраны!")
    exit()

# Подключение к SQLite
conn = sqlite3.connect("films.db")
cursor = conn.cursor()

# Создаем таблицу
cursor.execute("""
CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    release_year TEXT,
    director TEXT,
    box_office TEXT,
    country TEXT
)
""")

# Заполняем базу данных
cursor.executemany("INSERT INTO films (title, release_year, director, box_office, country) VALUES (?, ?, ?, ?, ?)", data)

conn.commit()
conn.close()

# Экспортируем данные в JSON
with open("films.json", "w", encoding="utf-8") as f:
    json.dump([{"title": d[0], "release_year": d[1], "director": d[2], "box_office": d[3], "country": d[4]} for d in data], f, indent=4, ensure_ascii=False)

print("Данные успешно сохранены в films.db и films.json")
