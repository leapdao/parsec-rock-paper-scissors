# Simple rock-paper-scissors backend on top of parsec plasma chain


[![PARSEC Labs](https://img.shields.io/badge/powered%20by-PARSEC-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAADHUlEQVRYhbWXS0iUURTH/2ewNNOKJAy1VIqkqAxJI+hBC6NcRNEiqKBFCBFBhC1qXdGDoG2PXa0rKaJaFLUowkWEuZCe9kBwUVJkCub8Wtw7dfn6ZuZzxv6rOd895/z/5577Guk/AagCyvP52f8SEAXQKqlNUkpSiaRuM3tfSKKSmG8GzI2r2I8dBNb539OA68C+AuqQgGUx35Zm8TXgEFDn7elANw77CxWwK6FfpvJabzcDPZ48DWzMFVwJpAK7HGgB9gK3gG3A4tDH+6WACqDWV17jW9MGPOQv+jOtjOtno6QuMzuU+WZmPyU9l/QcKDGzW5GYBkm7JY1I+iZpWNI1SaslDUlqkLTWuw9K2m5mv+IqbwQ+AmdzzE5LxF4CHI7Ohh+rBjYBx4DvwGC29SI/dX1+ik7kEFAWsTcAzTF+lcBp4K3POQgs9aLmxiW+HPToGXASmJdNSCT2CFAa2DOAe36xAfzMWrkPWANM8C/exFUXiTUvYH5AfjeSpzdfBXdiyDPoiviWB78z5PVAO9AZQw7wJBt3CreCt+TQVxcQzpJ0IBgrlbRAUpPcDuiT1B6T40Ou6o/kqB5gAOiMiavFnQnngZW4s+K+jxkP4tNARy4B3eRHGjiH6+8ioAN4B9zGbz/gjPf9BCwHTgFjBFsa17KOqIA3CQRkRIzhFmsat60W+hwzgavAU2BJkLsqa+UeJZJq8jl5mFzPM7hiZh+BOZKuS3otaZ2Zpf8EmH3JlzQlqSyfUxZUAXvkjujZko6H5IkBjCRsQTb8AJpi8q4A8j54UnKXQzEYlvTWk4Y9/4ecmMdMSm7vFoM6+XUU9tzMes2MiG8rUB0V8LhIAZK0NaHfCzMbigq4KWmiSAGbk/TbzEZjB3AHSjFI427QhQXJB1qJvw0niwdAKbAV2EmCgygUcXEKBIwDrwL7K7A+qYCZQO8UiIhiADiaVES9D5hK9OMfK5MR8XKKyHsmRR6IqAAuUfjCHAcuEHnAFiKkDfdcSyrkF3ADWJWUI9G/Y9yzbYekjZKWyx29ZZJG5e6SXkmPJN00s8+TKfI3mjTsYhPOBe0AAAAASUVORK5CYII=&link=https://parseclabs.org)](https://parseclabs.org)


![the rock](cover.png)

## Prerequisite

- Node.js 8+
- Yarn

## Develop

- `yarn`
- Read `index.js`
- Change
- Run `node index.js`

Some useful stuff can be found in `playground.js`

## Tests

[Jest](https://jestjs.io/) used for unit-testing. Put your test file near module that you want to test. For example, for `src/cool-module.js` you should create a file `src/cool-module.test.js`.

- `yarn test` — run tests
- `yarn test:watch` — run tests in watch mode
