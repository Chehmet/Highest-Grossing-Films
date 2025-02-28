document.addEventListener("DOMContentLoaded", function () {
    fetch("./films.json")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("films-table");
            const searchInput = document.getElementById("search");
            const searchButton = document.getElementById("search-btn");
            const errorMessage = document.getElementById("error-message");
            let sortedData = [...data];

            function renderTable(filteredData) {
                tableBody.innerHTML = "";
                if (errorMessage) {
                    errorMessage.classList.toggle("hidden", filteredData.length > 0);
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

            renderTable(sortedData);

            function filterMovies() {
                const query = searchInput.value.toLowerCase().trim();
                sortedData = data.filter(film =>
                    film.title.toLowerCase().includes(query)
                );
                renderTable(sortedData);
            }

            function updateSortIcons(column, order) {
                document.querySelectorAll(".sort-icon").forEach(icon => {
                    icon.textContent = "";
                });
                const activeHeader = document.querySelector(`th[data-column="${column}"] .sort-icon`);
                activeHeader.textContent = order === "asc" ? "▲" : "▼";
            }

            function sortTable(column) {
                const thElement = document.querySelector(`th[data-column="${column}"]`);
                let order = thElement.getAttribute("data-order");

                sortedData.sort((a, b) => {
                    let valA = a[column];
                    let valB = b[column];

                    if (!isNaN(valA) && !isNaN(valB)) {
                        return order === "desc" ? valA - valB : valB - valA;
                    } else {
                        return order === "desc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                });

                thElement.setAttribute("data-order", order === "desc" ? "asc" : "desc");
                updateSortIcons(column, order);
                renderTable(sortedData);
            }

            searchButton.addEventListener("click", filterMovies);
            searchInput.addEventListener("keyup", event => {
                if (event.key === "Enter") {
                    filterMovies();
                }
            });

            document.querySelectorAll("th").forEach(header => {
                header.addEventListener("click", function () {
                    const column = this.getAttribute("data-column");
                    sortTable(column);
                });
            });

            updateSortIcons("title", "desc");
        })
        .catch(error => console.error("Error loading data:", error));
});
