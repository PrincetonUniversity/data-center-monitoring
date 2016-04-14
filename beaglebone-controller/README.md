# BeagleBone Controller Code

This directory contains the python application that runs on a properly configured BeagleBone Black and handles communication with up to 54 sensors on 2 buses to gather temperature data. It also formats and sends the acquired data to the [`dcsense` server](/server-app) for storage.

## Setting up a BeagleBone

The application requires access to both user-accessible I<sup>2</sup>C buses on the BeagleBone Black. Because only 1 is emabled by default (and enabling the second is quite difficult), we use a pre-made system image for the BeagleBones with the bus already enabled.

 1. Write the [system image](https://onedrive.live.com/redir?resid=4DFA027ADF204B4!130687&authkey=!AAyTExoF8xXyH_I&ithint=file%2c7z) a 4GB MicroSD card, preferably from SanDisk to ensure that the exact storage size is the same. Use 7-zip to extract the `.img` file from the archive. Insert an empty FAT-formatted MicroSD card into your computer and use `$ dmesg | tail` to determine the `/dev` file corresponding to the device.  Be sure to use a *nix terminal to perform the write — Windows disk imaging tools tend not to work when copying this image. Assuming your MicroSD card is something like `/dev/sdc`, the following command should copy over the image correctly: `$ dd if=bb-sdcard.img of=/dev/sdc`.
 
 2. Solder up a BeagleBone cape with pull-up resistors for the I<sup>2</sup>C buses and headers to attach the I<sup>2</sup>C bus ribbon cables. We used [SparkFun's proto cape](https://www.sparkfun.com/products/12774). [TODO: Add schematic] Attach the cape to the BeagleBone.
 
 3. Attach lengths of 0.5"-pitch 10-conductor ribbon cable to the headers on the cape. We used [this cable](https://www.digikey.com/product-detail/en/3m/3365%2F10/3M155834-500-ND/3867374). On the cable, in the positions where you'd like to attach sensor boards, crimp a 2x5 position female IDC socket connector. We used [these](https://www.digikey.com/product-detail/en/assmann-wsw-components/AWP%2010-7240-T/AE11198-ND/5244604). Then, just plug in the sensors at the correct polarity (assuming the addresses are configured correctly), and the hardware should be good to go.
 
 4. Running the code: The above system image has a script configured to run at startup that can be found at `/etc/init.d/dcsense.sh`. The script waits for 2 minutes to allow the BeagleBone to initialize its ethernet interface and establish a network connection, then runs `pyrun.py` to begin collecting readings. When the script is running correctly, you should see 2 `python` processes in `top`. If you need to run the code manually, for example to test some changes, first kill the existing process(es) with `$ pkill python` and then re-run it using `$ python pyrun.py > ~/sensor.log 2> ~/sensor.err &`
