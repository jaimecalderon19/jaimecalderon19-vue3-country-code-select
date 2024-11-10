const getCountry = (): Promise<string> => {
    return new Promise((resolve) => {
        fetch("https://get.geojs.io/v1/ip/country")
            .then(response => response.text())
            .then(country => {
                console.log("País detectado:", country);
                // Aseguramos que el país esté en minúsculas y limpio de espacios
                const cleanCountry = country.trim().toLowerCase();
                console.log("País formateado:", cleanCountry);
                resolve(cleanCountry);
            })
            .catch((error) => {
                console.error("Error al obtener el país:", error);
                resolve("");
            });
    });
};

export default getCountry;