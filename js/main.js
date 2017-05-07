'use strict';

requirejs.config({
    baseUrl: 'js'
})

requirejs([
    'vendor/vue',
    'marshallers/index'
], function (Vue, marshallers) {
    // Create our Vue component.
    Vue.component('blueprint', {
        template: '#blueprint',
        props: ['entityLocations', 'maxX', 'maxY']
    })

    Vue.component('entity', {
        template: '#entity',
        props: ['entity'],
        computed: {
            style: function () {
                if (!this.entity) {
                    return
                }

                let rotation = 0

                if (this.entity.direction === 2) {
                    rotation = 90
                }
                else if (this.entity.direction === 4) {
                    rotation = 180
                }
                else if (this.entity.direction === 6) {
                    rotation = 270
                }

                return {
                    'transform': `rotate(${rotation}deg)`,
                    'background-image': `url(/img/icons/${this.entity.name}.png)`
                }
            }
        }
    })

    const app = new Vue({
        el: '#app',
        data: () => {
            return {
                blueprints: []
            }
        },
        methods: {
            getBlueprintLayout: function (blueprint) {
                let minX = Infinity
                let maxX = -Infinity
                let minY = Infinity
                let maxY = -Infinity

                // Get the X and Y ranges.
                if (!blueprint.blueprint.entities) {
                    return null
                }

                for (const entity of blueprint.blueprint.entities) {
                    entity.position.x = Math.floor(entity.position.x)
                    entity.position.y = Math.floor(entity.position.y)

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
                let modifierX = (minX < 0) ? Math.abs(minX) : 0
                let modifierY = (minY < 0) ? Math.abs(minY) : 0

                minX += modifierX
                minY += modifierY

                modifierX += 1
                modifierY += 1

                maxX += modifierX
                maxY += modifierY

                // Build up an object which contains co-ordinates.
                const entityLocations = {}
                for (const entity of blueprint.blueprint.entities) {
                    const position = entity.position

                    if (entityLocations[position.x + modifierX] === undefined) {
                        entityLocations[position.x + modifierX] = {}
                    }

                    entityLocations[position.x + modifierX][position.y + modifierY] = entity
                }

                return [entityLocations, maxX, maxY]
            },
            importString: function () {
                this.blueprints = []

                const value = this.$refs.import.value.trim()

                // Get the version number from the first character.
                const version = value[0]
                let str = value.substr(1)

                // Try to load the marshaller for this version.
                const marshaller = marshallers.getMarshaller(version)

                if (!marshaller) {
                    console.error(`Unable to find a suitable marshaller for this blueprint string version (${version}).`)
                    return
                }

                const [data, json_str] = marshaller.decode(str)

                // Data can be either a blueprint book or an individual blueprint. Figure out what we've got.
                if (data.blueprint) {
                    const blueprintData = this.getBlueprintLayout(data)

                    if (blueprintData) {
                        this.blueprints.push(blueprintData)
                    }
                }

                if (data.blueprint_book) {
                    for (let index in data.blueprint_book.blueprints) {
                        let blueprint = data.blueprint_book.blueprints[index]
                        const blueprintData = this.getBlueprintLayout(blueprint)

                        if (blueprintData) {
                            this.blueprints.push(blueprintData)
                        }
                    }
                }
            }
        }
    })
});