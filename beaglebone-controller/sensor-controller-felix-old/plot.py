
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

temp = [23.2, 25.4, 24.8, 25.7, 22.4, 24.9,26.0,25.4,26.1, 25.5]
x = [1,2,3,4,5,6,7,8,9,10]
y = [2,5,7,8,9,2,4,6,3,10]
area = np.pi * (np.max(temp) * 0.5)**2 # 0 to 15 point radiuses

plt.title("The Plot of Temperature")
plt.xlabel("Position horizontally (m)")
plt.ylabel('Position horizontally (m)')

plt.scatter(x, y, s=area, c=temp, alpha=0.5) 

plt.colorbar()
plt.grid(True)
plt.show()