document.addEventListener("DOMContentLoaded", function () {
    fetch("./films.json")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("films-table");

            data.forEach(film => {
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
        })
        .catch(error => console.error("Ошибка загрузки данных:", error));
});
