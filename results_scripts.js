// Función para calcular la distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    var radioTierra = 6371; // Radio de la Tierra en kilómetros
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distancia = radioTierra * c; // Distancia en kilómetros
    return distancia;
}

// Función para convertir grados a radianes
function toRad(grados) {
    return grados * Math.PI / 180;
}

function creoMapa(latitud1, longitud1, latitud2, longitud2) {

    // Crea un mapa en el contenedor con id 'map'
    var mapa = L.map('map').setView([latitud1, longitud1], 3);

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);


   
    var marcador1 = L.marker([latitud1, longitud1]).addTo(mapa);
    var marcador2 = L.marker([latitud2, longitud2]).addTo(mapa);

   
    var linea = L.polyline([[latitud1, longitud1], [latitud2, longitud2]], { color: 'blue' }).addTo(mapa);

    
    var bounds = L.latLngBounds([
        [latitud1, longitud1],
        [latitud2, longitud2]
    ]);



    // Calcula la distancia entre los puntos
    var distancia = calcularDistancia(latitud1, longitud1, latitud2, longitud2).toFixed(2);

    // Muestra la distancia en el mapa
    linea.bindPopup('Estas a: ' + distancia + ' km de tu proximo destino').openPopup();



}


function datosTiempo(weatherResult, mesMejor,airport) {
    const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
    const tarjetaGrande = document.getElementById("tarjeta-grande");
    const weatherIcons = createWeatherIcons();
    let tarjetaSeleccionada = null;

    const weatherResultData = weatherResult;

    function obtenerNombreMes(numeroMes) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[numeroMes - 1] || 'Mes no válido';
    }
    function formatFecha(fecha) {
        console.log(fecha)
        const parts = fecha.split("-");
        const dia = parts[2];
        const mes = parts[1];
        const año = parts[0].substr(2, 2); // Obtiene los últimos dos dígitos del año
        return año + mes + dia;
    }
    function mostrarDatosAmpliados(data, datosGuardados) {
        const fechaIdaFormateada = formatFecha(datosGuardados.fechaIda);
        const fechaVueltaFormateada = formatFecha(datosGuardados.fechaVuelta);
        console.log(fechaIdaFormateada, fechaVueltaFormateada)



        tarjetaGrande.innerHTML = `
<div class="weather-icon">${weatherIcons[data.mostCommonWeatherCode]}</div>
<h4>${Math.ceil(data.averageTempMean)}°C</h4>
<h2>${obtenerNombreMes(data.month)}</h2>
<p>Temperatura Máxima Promedio: ${data.averageTemperatureMax}°C</p>
<p>Temperatura Promedio: ${data.averageTempMean}°C</p>
<p>Temperatura Mínima Promedio: ${data.averageTemperatureMin}°C</p>
<p>Precipitación Promedio: ${data.averagePrecipitation} mm</p>
<p>Dias al mes sin lluvia: ${Math.floor(data.percentageOfDaysWithLowPrecipitation * 30 / 100)}</p>
<h2>Datos Adicionales:</h2>
<p>Fecha de Ida: ${datosGuardados.fechaIda}</p>
<p>Fecha de Vuelta: ${datosGuardados.fechaVuelta}</p>
<p>Número de Viajeros: ${datosGuardados.viajeros}</p>
<p>Clase: ${datosGuardados.clase}</p>
<button type="button" id="botonIndex">Nueva busqueda</button>
<button type="button" id="botonSkyscanner">Busqueda de vuelos</button>
<button type="button" id="botonPDF">Imprimir en PDF</button>
`;
console.log(`https://www.skyscanner.es/transporte/vuelos/${airport[0].toLowerCase()}/${airport[1].toLowerCase()}/${fechaIdaFormateada}/${fechaVueltaFormateada}/?adultsv2=${datosGuardados.viajeros}&cabinclass=${datosGuardados.clase}&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=1`)
        // Evento para el botón Index
        const botonIndex = document.getElementById("botonIndex");
        botonIndex.addEventListener("click", function() {
            window.location.href = "index.html";
        });
        // Evento para el botón Skyscanner
        const botonSkyscanner = document.getElementById("botonSkyscanner");
        botonSkyscanner.addEventListener("click", function () {
            window.open(`https://www.skyscanner.es/transporte/vuelos/${airport[0].toLowerCase()}/${airport[1].toLowerCase()}/${fechaIdaFormateada}/${fechaVueltaFormateada}/?adultsv2=${datosGuardados.viajeros}&cabinclass=${datosGuardados.clase}&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=1`);
        });

        // Evento para el botón PDF
        const botonPDF = document.getElementById("botonPDF");
        botonPDF.addEventListener("click", function () {
            // Abre el cuadro de diálogo de impresión del navegador
            window.print();
        });

    }

    function limpiarTarjetaGrande() {
        tarjetaGrande.innerHTML = '';
    }

    weatherResultData.forEach((data, index) => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");
        tarjeta.dataset.index = index;

        const weatherIcon = weatherIcons[data.mostCommonWeatherCode];

        if (data.month === mesMejor) {
            tarjeta.classList.add("especial");
            tarjeta.innerHTML += '<p>Esta es tu mejor opción</p>';
        }

        tarjeta.innerHTML += `
        <div class="weather-icon">${weatherIcon}</div>
        <h4>${Math.ceil(data.averageTempMean)}°C</h4>
        <h2>${obtenerNombreMes(data.month)}</h2>
        <p>Temperatura Máxima Promedio: ${data.averageTemperatureMax}°C</p>
        <p>Temperatura Mínima Promedio: ${data.averageTemperatureMin}°C</p>
        <p>Precipitación Promedio: ${data.averagePrecipitation} mm</p>
        <p>Días al mes sin lluvia: ${Math.floor(data.percentageOfDaysWithLowPrecipitation * 30 / 100)}</p>
        `;

        tarjeta.addEventListener("click", function () {
            document.querySelectorAll(".tarjeta").forEach(t => t.classList.remove("seleccionada"));
            tarjeta.classList.add("seleccionada");
            if (tarjetaSeleccionada !== tarjeta) {
                limpiarTarjetaGrande();
                tarjetaSeleccionada = tarjeta;
                mostrarFormulario(index);
            }
        });

        contenedorTarjetas.appendChild(tarjeta);
    });

    function mostrarFormulario(tarjetaIndex) {
        const formularioContainer = document.getElementById("formulario-container");
        formularioContainer.innerHTML = `
            <form id="formulario-datos">
            <label for="fechaIda">Fecha de Ida: <input type="date" id="fechaIda" min="2023-10-26"></label><br>
            <label for="fechaVuelta">Fecha de Vuelta: <input type="date" id="fechaVuelta" min="2023-10-26"></label><br>
                <label for="viajeros">Número de Viajeros: <input type="number" id="viajeros"></label><br>
                <label for="clase">Clase: 
                    <select id="clase">
                        <option value="economy">Turista</option>
                        <option value="premiumeconomy">Turista Superior</option>
                        <option value="business">Business</option>
                        <option value="first">Primera</option>
                    </select>
                </label><br>
                <button type="button" id="guardar-datos">Guardar</button>
            </form>
        `;

        const guardarDatosBtn = document.getElementById("guardar-datos");
        guardarDatosBtn.addEventListener("click", function () {
            const fechaIda = document.getElementById("fechaIda").value;
            const fechaVuelta = document.getElementById("fechaVuelta").value;
            const viajeros = document.getElementById("viajeros").value;
            const clase = document.getElementById("clase").value;

            const datosGuardados = {
                fechaIda: fechaIda,
                fechaVuelta: fechaVuelta,
                viajeros: viajeros,
                clase: clase
            };

            mostrarDatosAmpliados(weatherResultData[tarjetaIndex], datosGuardados);

            // Ocultar el formulario después de guardar los datos
            formularioContainer.innerHTML = '';
        });
    }

}




// Recuperar datos de sessionStorage y convertirlos de nuevo a objetos
const geolocation = JSON.parse(sessionStorage.getItem("geolocation"));
const results = JSON.parse(sessionStorage.getItem("results"));
const weatherResult = JSON.parse(sessionStorage.getItem("weatherResult"));

const latitud1 = geolocation.latitud;
const longitud1 = geolocation.longitud;
const latitud2 = results.lat;
const longitud2 = results.lon;


function createWeatherIcons() {
    const weatherIcons = {
        0: "☀️", // Clear sky
        1: "⛅", // Mainly clear
        2: "⛅", // Partly cloudy
        3: "⛅", // Overcast
        45: "☁️", // Fog
        48: "☁️", // Depositing rime fog
        51: "🌧️", // Drizzle: Light intensity
        53: "🌧️", // Drizzle: Moderate intensity
        55: "🌧️", // Drizzle: Dense intensity
        56: "🌨️", // Freezing Drizzle: Light intensity
        57: "🌨️", // Freezing Drizzle: Dense intensity
        61: "🌧️", // Rain: Slight intensity
        63: "🌧️", // Rain: Moderate intensity
        65: "🌧️", // Rain: Heavy intensity
        66: "🌨️", // Freezing Rain: Light intensity
        67: "🌨️", // Freezing Rain: Heavy intensity
        71: "❄️", // Snow fall: Slight intensity
        73: "❄️", // Snow fall: Moderate intensity
        75: "❄️", // Snow fall: Heavy intensity
        77: "❄️", // Snow grains
        80: "🌧️", // Rain showers: Slight intensity
        81: "🌧️", // Rain showers: Moderate intensity
        82: "🌧️", // Rain showers: Violent intensity
        85: "❄️", // Snow showers: Slight intensity
        86: "❄️", // Snow showers: Heavy intensity
        95: "⛈️", // Thunderstorm: Slight
        96: "⛈️", // Thunderstorm with light hail
        99: "⛈️"  // Thunderstorm with heavy hail
    };

    return weatherIcons;
}
function ordenaMesTemperaturaMaxMin(weatherResult) {
    
    const meses = [];

    // Llena el array con objetos que contienen el número del mes y su temperatura mínima
    weatherResult.forEach(data => {
        meses.push({
            mes: data.month,
            temperaturaMaxima: parseFloat(data.averageTempMean)
        });
    });

    // Ordena el array de meses por temperatura maxima de forma descendente
    meses.sort((a, b) => b.temperaturaMaxima - a.temperaturaMaxima);

    // Crea un nuevo array solo con los números de los meses ordenados por la temperatura mínima
    const mesesOrdenados = meses.map(item => item.mes);

    console.log('Meses ordenados por Temperatura media de max a min:', mesesOrdenados);
    return mesesOrdenados;
}
const mesesTempOrdenados = ordenaMesTemperaturaMaxMin(weatherResult);

function obtenerMesesOrdenadosPorMinimaDiferencia(weatherResult) {
    // Crea un array para almacenar los números de los meses junto con su diferencia
    const mesesConDiferencia = [];

    // Llena el array con objetos que contienen el número del mes y su diferencia entre temperaturas máximas y mínimas
    weatherResult.forEach(data => {
        const diferencia = Math.abs(parseFloat(data.averageTemperatureMax) - parseFloat(data.averageTemperatureMin));
        mesesConDiferencia.push({
            mes: data.month,
            diferencia: diferencia
        });
    });

    // Ordena el array de meses por diferencia de forma ascendente
    mesesConDiferencia.sort((a, b) => a.diferencia - b.diferencia);

    // Crea un nuevo array solo con los números de los meses ordenados por la mínima diferencia
    const mesesOrdenadosPorDiferencia = mesesConDiferencia.map(item => item.mes);

    console.log('Meses ordenados por Mínima Diferencia entre Temperaturas Máximas y Mínimas:', mesesOrdenadosPorDiferencia);
    return mesesOrdenadosPorDiferencia;
}

const mesesOrdenadosPorDiferencia = obtenerMesesOrdenadosPorMinimaDiferencia(weatherResult);


function obtenerMesesAleatorios(weatherResult) {
    // Crea un array para almacenar los números de los meses
    const meses = [];

    // Llena el array con los números de los meses
    weatherResult.forEach(data => {
        meses.push(data.month);
    });

    // Función de mezcla aleatoria (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Mezcla aleatoriamente el array de meses
    const mesesAleatorios = shuffleArray(meses);

    console.log('Meses Aleatorios:', mesesAleatorios);
    return mesesAleatorios;
}



function obtenerMesesOrdenadosPorLluvia(weatherResult) {
    // Crea un array para almacenar los números de los meses junto con la cantidad de lluvia
    const mesesConLluvia = [];

    // Llena el array con objetos que contienen el número del mes y la cantidad de lluvia
    weatherResult.forEach(data => {
        mesesConLluvia.push({
            mes: data.month,
            lluvia: parseFloat(data.averagePrecipitation)
        });
    });

    // Ordena el array de meses por cantidad de lluvia de forma descendente
    mesesConLluvia.sort((a, b) => b.lluvia - a.lluvia);

    // Crea un nuevo array solo con los números de los meses ordenados por la cantidad de lluvia
    const mesesOrdenadosPorLluvia = mesesConLluvia.map(item => item.mes);

    console.log('Meses ordenados por Cantidad de Lluvia:', mesesOrdenadosPorLluvia);
    return mesesOrdenadosPorLluvia;
}

const mesesOrdenadosPorLluvia = obtenerMesesOrdenadosPorLluvia(weatherResult);

function obtenerMesesOrdenadosPorBajaPrecipitacion(weatherResult) {
    // Crea un array para almacenar los números de los meses junto con el porcentaje de días con baja precipitación
    const mesesConBajaPrecipitacion = [];

    // Llena el array con objetos que contienen el número del mes y el porcentaje de días con baja precipitación
    weatherResult.forEach(data => {
        mesesConBajaPrecipitacion.push({
            mes: data.month,
            bajaPrecipitacion: parseFloat(data.percentageOfDaysWithLowPrecipitation)
        });
    });

    // Ordena el array de meses por porcentaje de días con baja precipitación de forma ascendente
    mesesConBajaPrecipitacion.sort((a, b) => a.bajaPrecipitacion - b.bajaPrecipitacion);

    // Crea un nuevo array solo con los números de los meses ordenados por el porcentaje de días con baja precipitación
    const mesesOrdenadosPorBajaPrecipitacion = mesesConBajaPrecipitacion.map(item => item.mes);

    console.log('Meses ordenados por Porcentaje de Días con Baja Precipitación:', mesesOrdenadosPorBajaPrecipitacion);
    return mesesOrdenadosPorBajaPrecipitacion;
}

const mesesOrdenadosPorBajaPrecipitacion = obtenerMesesOrdenadosPorBajaPrecipitacion(weatherResult);

function calculadoraMejorOpcion1(mesesTempOrdenados, mesesOrdenadosPorLluvia) {


}

function encontrarAeropuertoCercano(latitud1, longitud1, latitud2, longitud2) {
    return fetch('data.json') 
        .then(response => response.json())
        .then(aeropuertos => {
            const coordenadas = [
                { latitud: latitud1, longitud: longitud1 },
                { latitud: latitud2, longitud: longitud2 }
            ];

            const aeropuertosCercanos = [];

            coordenadas.forEach(coordenada => {
                let aeropuertoCercano = null;
                let distanciaMinima = Number.MAX_VALUE;

                aeropuertos.forEach(aeropuerto => {
                    const distancia = calcularDistancia(coordenada.latitud, coordenada.longitud, aeropuerto.latitude, aeropuerto.longitude);
                    if (distancia < distanciaMinima) {
                        distanciaMinima = distancia;
                        aeropuertoCercano = aeropuerto.name;
                    }
                });

                aeropuertosCercanos.push(aeropuertoCercano);
                console.log(`Aeropuerto más cercano a la coordenada (${coordenada.latitud}, ${coordenada.longitud}): ${aeropuertoCercano}`);
            });

            return aeropuertosCercanos;
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
            return []; 
        });
}


encontrarAeropuertoCercano(latitud1, longitud1, latitud2, longitud2)
    .then(airport => {
        console.log(airport);
        datosTiempo(weatherResult, mesMejor,airport);
    })
    .catch(error => {
        console.error('Error:', error);
    });


creoMapa(latitud1, longitud1, latitud2, longitud2)
const mesMejor = mesesOrdenadosPorBajaPrecipitacion[11]
console.log(mesMejor)




