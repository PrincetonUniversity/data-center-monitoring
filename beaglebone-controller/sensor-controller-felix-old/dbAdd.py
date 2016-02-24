import mysql.connector
import connection
from mysql.connector import Error
 
def insertTemp(temps):
    query = "INSERT INTO LabTemperature(sensor0,sensor1, sensor2,sensor3,sensor4,sensor5,sensor6,sensor7,sensor8,sensor9) "\
    " VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    
    args = (temps[0], temps[1],temps[2],temps[3],temps[4],temps[5],temps[6],temps[7],temps[8],temps[9])
            
 
    try:
        conn = connection.connect()
        
        if (conn != None):
            cursor = conn.cursor()
            cursor.execute(query, args)
            conn.commit()
            
    except Error as e:
        print('Error:', e)
 
    finally:
        cursor.close()
        conn.close()