# BeagleBone Cape

This directory contains files related to the circuit we build on the [BeagleBone Black Proto Cape from SparkFun](https://www.sparkfun.com/products/12774) in order to provide pull-up resistors for the 2 I<sup>2</sup>C buses and connections between BeagleBone pins and connector headers for the bus cables.

![](/report-roshea/figures/cape.jpg)

## Schematic

![](/beaglebone-cape/beaglebone-cape.png)

## Components

The cape only has 3 types of components. 

### Mounting Headers

You'll need 2 2x29 breakaway headers for the connections between the cape and the BeagleBone's pins. We used [these headers from sparkfun](https://www.sparkfun.com/products/12791). Only one of these (`P9`) is shown in the schematic, as we don't make use of any pins on the BeagleBone's P8 header.

### Cable Headers

You'll need 2 2x5 breakaway headers to provide connections for the ribbon cable. We again used the sparkfun headers from above, cut down to 2x5-pin lengths.

### Pull-up Resistors

You'll need 4 resistors to pull up the SDA and SCL lines for each I<sup>2</sup>C bus. The value should be between 2kΩ and 10kΩ. We used 5kΩ.

