tempF = temp * 9/5 + 32;
plot(time, tempF)
title('EQuad J314 Server Room Temperature Measured by DCsense Sensor Board')
xlabel('Time')
ylabel('Recorded Temperature (°F)')
ylim([(min(tempF) - 7) (max(tempF) + 7)]);