'use strict';

requirejs.config({
    baseUrl: 'js'
})

requirejs([
    'marshallers/index'
], function (marshallers) {
    const input = document.querySelector('.js-String-Input')

    input.addEventListener('change', (e) => {
        // Get the version number from the first character.
        const version = e.target.value[0]
        let str = e.target.value.substr(1)

        // Try to load the marshaller for this version.
        const marshaller = marshallers.getMarshaller(version)

        if (!marshaller) {
            console.error(`Unable to find a suitable marshaller for this blueprint string version (${version}).`)
            return
        }

        const [blueprint, json_str] = marshaller.decode(str)
        console.log(blueprint)
        document.querySelector(".js-String-Debug").innerHTML = json_str

        // Get the X and Y ranges.
        let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity]
        for (const entity of blueprint.blueprint.entities) {
            const position = entity.position
            if (position.x < minX) {
                minX = position.x
            }

            if (position.x > maxX) {
                maxX = position.x
            }

            if (position.y < minY) {
                minY = position.y
            }

            if (position.y > maxY) {
                maxY = position.y
            }
        }

        // All entity co-ordinates will need adjusting to be able to be mapped onto the grid.
        const modifierX = (minX < 0) ? Math.abs(minX) : 0
        const modifierY = (minY < 0) ? Math.abs(minY) : 0
    })
});