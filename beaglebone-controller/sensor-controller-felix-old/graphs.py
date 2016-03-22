import matplotlib.pyplot as plt
import numpy as np


m = plt.figure()
x = np.arange(6)
y = np.arange(5)

plt.title("The Plot of Temperature")

x, y = 0.2, 0.8
z = m(x, y)

m.show(z)