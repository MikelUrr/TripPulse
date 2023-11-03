document.addEventListener("DOMContentLoaded", function () {
    const formContainer = document.getElementById('form-container');
    const placeInput = document.getElementById('placeinput');
    const submitButton = document.getElementById('submit-button');
    const resultadosLista = document.getElementById('resultados-lista');
    const resultadosContainer = document.getElementById('resultados-container');




    submitButton.addEventListener('click', async () => {


        const placeInputValue = await document.getElementById('placeinput').value;

        console.log('Lugar:', placeInputValue);

        formContainer.style.display = 'none';
        if (placeInputValue !== "cualquiera") {
            try {
                const resultados = await getPlaceDetails(placeInputValue);
                console.log("tamaño resultado", resultados.length)

                if (resultados.length >= 1) {
                    resultadosLista.innerHTML = '';
                    console.log("holi estoy por aqui y soy un desastre")
                    resultados.forEach(r => {
                        const listItem = document.createElement('li');
                        listItem.textContent = r.display_name;
                        listItem.addEventListener('click', () => {
                            selectedResult = r;
                            console.log('Usuario seleccionó:', selectedResult);
                            function obtenerGeolocalizacion() {
                                return new Promise((resolve, reject) => {
                                    if ("geolocation" in navigator) {
                                        navigator.geolocation.getCurrentPosition(function (position) {
                                            const latitud = parseFloat(position.coords.latitude);
                                            const longitud = parseFloat(position.coords.longitude);
                                            const geoloc = {
                                                "latitud": latitud,
                                                "longitud": longitud
                                            };
                                            resolve(geoloc);
                                        }, function (error) {
                                            reject(error);
                                        });
                                    } else {
                                        reject("Geolocalización no está disponible en este navegador.");
                                    }
                                });
                            }

                            async function obtenerCoordenadasYProcesar(selectedResult, temperatureChoiceValue, rainChoice) {
                                try {
                                    const geoloc = await obtenerGeolocalizacion();
                                    console.log("Coordenadas: " + geoloc);

                                    // Llamar a CalcularMeteo y resultsStorage con las coordenadas obtenidas
                                    const resultadoMeteo = await CalcularMeteo(selectedResult.lat, selectedResult.lon);
                                    console.log("resultado meteo", resultadoMeteo)
                                    resultsStorage(geoloc, selectedResult, resultadoMeteo, temperatureChoiceValue, rainChoice);


                                    //redirigimos a donde mostramos los resultados
                                    setTimeout(function () {
                                        window.location.href = 'results.html';
                                    }, 10);



                                } catch (error) {
                                    console.error(error);
                                }
                            }

                            // Llamar a la función asíncrona
                            obtenerCoordenadasYProcesar(selectedResult, null, null);


                            // Ocultar el div de resultados y mostrar el formulario
                            resultadosContainer.style.display = 'none';

                            //formContainer.style.display = 'block';
                        });
                        console.log("resutadoslista cantidad", resultadosLista)
                        resultadosLista.appendChild(listItem);
                    });

                    // Mostrar el contenedor de resultados
                    resultadosContainer.style.display = 'block';

                    // Ocultar el formulario
                    formContainer.style.display = 'none';
                } else {


                    /*                     resultadosLista.innerHTML = '<li>No se encontraron resultados.</li>';
                                        resultadosContainer.style.display = 'none'; */
                }
            } catch (error) {
                console.error('Error al obtener detalles del lugar:', error);
            }
        } else {

            // Si el lugar es "cualquiera", ocultar el div de resultados
            resultadosContainer.style.display = 'none';
        }

        
    });


    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const radioTierra = 6371; // Radio de la Tierra en kilómetros
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distancia = radioTierra * c; // Distancia en kilómetros
        return distancia;
    }

    async function getPlaceDetails(placeName) {
        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener detalles del lugar.');
            }

            const distanciaMaxima = 100;

            function filtrarCiudades(data) {
                return data.filter((ciudad, index, array) => {
                    for (let i = index + 1; i < array.length; i++) {
                        const distancia = calcularDistancia(
                            ciudad.lat,
                            ciudad.lon,
                            array[i].lat,
                            array[i].lon
                        );
                        if (distancia < distanciaMaxima) {
                            return false;
                        }
                    }
                    return true;
                });
            }

            const ciudadesFiltradas = filtrarCiudades(data);

            console.log("Ciudades filtradas:", ciudadesFiltradas, "Longitud:", ciudadesFiltradas.length);
            return ciudadesFiltradas
        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    }
    
    async function obtenerDatosMeteorologicos(latitud, longitud) {
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitud}&longitude=${longitud}&start_date=2013-01-01&end_date=2020-02-01&daily=weathercode,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum&timezone=Europe%2FBerlin`;
        console.log(url)

        try {
            const respuesta = await fetch(url);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                const weatherResultJSON = JSON.stringify(datos);

                // Almacenar nuevos resultados en sessionStorage
                sessionStorage.setItem("tiemporaw", weatherResultJSON);
                return datos;
            } else {
                throw new Error('No se pudieron obtener los datos meteorológicos.');
            }
        } catch (error) {
            console.error('Error al obtener datos meteorológicos:', error);
            throw error;
        }
    }

    //repasar las siguientes dos funciones
    async function CalcularMeteo(latitude, longitude) {
        try {
            const resultados = await obtenerDatosMeteorologicos(latitude, longitude);

            // Obtener datos para todos los meses del año
            const datosPorMes = Array.from({ length: 12 }, (_, mes) => {
                const maxTemperaturesForMonth = [];
                const minTemperaturesForMonth = [];
                const precipitation = [];
                const temperatureMean = [];
                const weatherCodes = [];

                // Filtrar datos por mes
                for (let i = 0; i < resultados.daily.time.length; i++) {
                    const fecha = resultados.daily.time[i];
                    const month = parseInt(fecha.split('-')[1]);

                    if (month === mes + 1) {
                        maxTemperaturesForMonth.push(resultados.daily.temperature_2m_max[i]);
                        minTemperaturesForMonth.push(resultados.daily.temperature_2m_min[i]);
                        precipitation.push(resultados.daily.precipitation_sum[i]);
                        temperatureMean.push(resultados.daily.temperature_2m_mean[i]);
                        weatherCodes.push(resultados.daily.weathercode[i]);
                    }
                }

                // Calcular promedio para el mes actual
                const averageTemperatureMax = maxTemperaturesForMonth.reduce((acc, temperature) => acc + temperature, 0) / maxTemperaturesForMonth.length;
                const averageTemperatureMin = minTemperaturesForMonth.reduce((acc, temperature) => acc + temperature, 0) / minTemperaturesForMonth.length;
                const averageTempMean = temperatureMean.reduce((acc, temperature) => acc + temperature, 0) / temperatureMean.length;
                const averagePrecipitation = precipitation.reduce((acc, temp) => acc + temp, 0) / precipitation.length;

                // Calcular el porcentaje de días con precipitación menor a 0.01
                const daysWithLowPrecipitation = precipitation.filter(precip => precip < 0.01).length;
                const percentageOfDaysWithLowPrecipitation = (daysWithLowPrecipitation / precipitation.length) * 100;

                // Encontrar el código de clima más común para el mes actual
                const mostCommonWeatherCode = findMostCommonWeatherCode(weatherCodes);

                // Calcular valores máximo y mínimo para temperatura
                const maxTemperatureMax = Math.max(...maxTemperaturesForMonth);
                const minTemperatureMin = Math.min(...minTemperaturesForMonth);

                return {
                    month: mes + 1,
                    averageTemperatureMax: averageTemperatureMax.toFixed(2),
                    averageTemperatureMin: averageTemperatureMin.toFixed(2),
                    maxTemperatureMax: maxTemperatureMax.toFixed(2),
                    minTemperatureMin: minTemperatureMin.toFixed(2),
                    averagePrecipitation: averagePrecipitation.toFixed(2),
                    percentageOfDaysWithLowPrecipitation: percentageOfDaysWithLowPrecipitation.toFixed(2),
                    averageTempMean: averageTempMean.toFixed(2),
                    mostCommonWeatherCode: mostCommonWeatherCode,

                };
            });

            return datosPorMes;
        } catch (error) {
            // Manejar errores aquí
            console.error(error);
            return null;
        }
    }

    function findMostCommonWeatherCode(weatherCodes) {
        const codeCount = weatherCodes.reduce((acc, code) => {
            acc[code] = (acc[code] || 0) + 1;
            return acc;
        }, {});

        const mostCommonCode = Object.keys(codeCount).reduce((a, b) => (codeCount[a] > codeCount[b] ? a : b));

        return mostCommonCode;
    }


    function resultsStorage(geolocation, results, weatherResult, temperatureChoiceValue, rainChoice) {
        // Convertir objetos a cadenas JSON
        const geolocationJSON = JSON.stringify(geolocation);
        const resultsJSON = JSON.stringify(results);
        const weatherResultJSON = JSON.stringify(weatherResult);

        // Almacenar nuevos resultados en sessionStorage
        sessionStorage.setItem("geolocation", geolocationJSON);
        sessionStorage.setItem("results", resultsJSON);
        sessionStorage.setItem("weatherResult", weatherResultJSON);


        // Recuperar los resultados almacenados en localStorage
        let storedResults = JSON.parse(localStorage.getItem("searchResults")) || [];

        // Crear un objeto para la nueva búsqueda
        const newSearch = {
            geolocation: geolocation,
            results: results,
            weatherResult: weatherResult

        };

        // Agregar la nueva búsqueda al array de resultados
        storedResults.push(newSearch);

        // Almacenar el array actualizado en localStorage
        localStorage.setItem("searchResults", JSON.stringify(storedResults));
    }






});
