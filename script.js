document.addEventListener("DOMContentLoaded", function () {
    fetch("./films.json")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("films-table");
            const searchInput = document.getElementById("search");
            const searchButton = document.getElementById("search-btn");
            const errorMessage = document.getElementById("error-message");

            if (!tableBody || !searchInput || !searchButton) {
                console.error("Ошибка: отсутствуют элементы интерфейса!");
                return;
            }

            function renderTable(filteredData) {
                tableBody.innerHTML = "";
                
                if (errorMessage) {
                    if (filteredData.length === 0) {
                        errorMessage.classList.remove("hidden");
                    } else {
                        errorMessage.classList.add("hidden");
                    }
                }

                filteredData.forEach(film => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${film.title}</td>
                        <td>${film.release_year}</td>
                        <td>${film.director}</td>
                        <td>${film.box_office}</td>
                        <td>${film.country}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            // 🔥 Показываем все фильмы при загрузке
            renderTable(data);

            function filterMovies() {
                const query = searchInput.value.toLowerCase().trim();
                const filteredMovies = data.filter(film =>
                    film.title.toLowerCase().includes(query)
                );
                renderTable(filteredMovies);
            }

            // События для поиска
            searchButton.addEventListener("click", filterMovies);
            searchInput.addEventListener("keyup", function (event) {
                if (event.key === "Enter") {
                    filterMovies();
                }
            });
        })
        .catch(error => console.error("Ошибка загрузки данных:", error));
});
