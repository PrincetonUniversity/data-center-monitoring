# Sensor Board

The `dcsense` PCB is the sensing component of the system. It is a small PCB with a TI TMP175 digital temperature sensor, DIP switches for configuring the sensor's I<sup>2</sup>C address, and a header for connecting the board to a ribbon cable via a connector. Other features include a power indicator LED and 2 decoupling capacitors.

![](/report/figures/dcsense-board-straight.jpg)

## Schematic

![](/dcsense-board/3.1-ryanoshea-final-miniaturized-version/V3_brd_filled.png)

Reproduced below without copper pours for visibility.

![](/dcsense-board/3.1-ryanoshea-final-miniaturized-version/V3_brd.png)

## Addressing

The 6 switches are used to configure the address of the sensor on the bus. Beacause the switches control only 3 address pins on the TMP175 sensor (using trinary logic), not all configurations of switches will produce valid addresses. Two switches are used to configure one pin. Each pair of switches can only be set to a certain combination of values. Those pairs are (from left to right) 1 and 4, 2 and 5, 3 and 6. For a given pair of switches, the only restriction is that **both switches can't be ON simultaneously**. This is because for each pair, one switch pulls the address pin to GND and one pulls it up to V<sub>DD</sub>. Leaving both switches OFF allows the voltage of the pin to float, which a third valid option (hence trinary logic). Having both switches ON creates a voltage divider and provides a steady voltage of V<sub>DD</sub>/2 to the pin, which causes undefined behavior (and creates a leakage current that will waste unnecessary power). 

The valid address configurations are listed here, along with the decimal address values they correspond to: \[[JSON](/dcsense-board/3.1-ryanoshea-final-miniaturized-version/address-map.json)\]\[[Excel](/dcsense-board/3.1-ryanoshea-final-miniaturized-version/address-map.xlsx)\]

## History

The 3 major versions of the board are shown below.

![](/report/figures/dcsense-board-versions.jpg)
