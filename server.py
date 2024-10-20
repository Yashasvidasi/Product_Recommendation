from flask import Flask, request, jsonify
import csv
from flask_cors import CORS
from hbase.get import Get
from hbase.put import Put
from hbase.rest_client import HBaseRESTClient
from kafka import KafkaProducer
from json import dumps

client = HBaseRESTClient(['http://localhost:8080'])

get = Get(client)
put = Put(client)



app = Flask(__name__)
CORS(app) 
# Load user data from the CSV file
def load_user_data():
    users = {}
    with open('users.csv', mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            users[row['username']] = {
                'userid': row['userid'],
                'profile_picture': row['profile_picture']
            }
    return users

def load_user_data_id():
    users = {}
    with open('users.csv', mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            users[row['userid']] = {
                'username': row['username'],
                'profile_picture': row['profile_picture']
            }
    return users

def load_products():
    products = {}
    with open('products.csv', mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            pid = int(row['ï»¿pp'])
            products[pid] = {
                'name': row['ProductName'],
                'link': row['ProductLink']
            }
    return products

def get_product_data(pid):
    y = get.get("product_info1", f"product_{pid}")
    # Initialize a dictionary for all sales columns with default value 0
    sales_data = {str(i): 0 for i in range(1, 61)}
    total_value = 0
    
    # Check if row exists and extract the existing values
    if 'row' in y and len(y['row']) > 0:
        cells = y['row'][0]['cell']
       
        for cell in cells:
            # Extract the column name (e.g., 'sales:1', 'sales:30')
            column_name = cell['column'].decode().split(':')[1]
            
            # Extract the value for the column
            value_bytes = cell['$']
            value_int = int.from_bytes(value_bytes, byteorder='big')
            
            if column_name == 'total':
                # Special handling for 'sales:total'
                total_value = value_int
            else:
                # Update sales data for the corresponding column
                sales_data[column_name] = value_int
    
    # Convert sales_data dictionary to a list of tuples and append the total
    result = [(int(k), v) for k, v in sales_data.items()]


    return result


def get_average_selling_rate(pid):
    y = get.get("product_info1", f"product_{pid}")
    total_value = 0
    
    
    if 'row' in y and len(y['row']) > 0:
        cells = y['row'][0]['cell']
       
        for cell in cells:
            # Extract the column name (e.g., 'sales:1', 'sales:30')
            column_name = cell['column'].decode().split(':')[1]
            
            # Extract the value for the column
            value_bytes = cell['$']
            value_int = int.from_bytes(value_bytes, byteorder='big')
            
            if column_name == 'total':
                # Special handling for 'sales:total'
                total_value = value_int
    
    return total_value/12

def get_average_customer_rate(pid):
    l = []
    c = 0
    overallavg_s= 0
    overallavg_q = 0
    for a1 in range(100, 201):
        y = get.get("user_purchases1", f"user_{a1}_product_{pid}")
        
        if 'row' in y and len(y['row']) > 0:
            c+=1
            cells = y['row'][0]['cell']
            
            value_bytes_latest = cells[0]['$']  # Review cell
            value_bytes_o = cells[1]['$']  # Quantity cell
            value_bytes_q = cells[2]['$']
            value_bytes_r = cells[3]['$']

            value_int_r = int.from_bytes(value_bytes_r, byteorder='big') 
            value_int_q = int.from_bytes(value_bytes_q, byteorder='big') 
            value_int_o = int.from_bytes(value_bytes_o, byteorder='big') 

            avg_s = value_int_r/value_int_o
            avg_q = value_int_q/value_int_o

            overallavg_q += avg_q
            overallavg_s += avg_s


    
    return [overallavg_s/c, overallavg_q/c]

def get_customer_satisfaction():
    c = 0
   
    finalr = 0
    for a1 in range(100, 201):
        overallavg_r = 0
        t = 0
        f = 0
        print(a1)
        for a2 in range(100, 201):
            y = get.get("user_purchases1", f"user_{a1}_product_{a2}")
            if 'row' in y and len(y['row']) > 0:
                f = 1
                t+=1
                cells = y['row'][0]['cell']
                
                value_bytes_o = cells[1]['$']  # Quantity cell
               
                value_bytes_r = cells[3]['$']

                value_int_r = int.from_bytes(value_bytes_r, byteorder='big') 
               
                value_int_o = int.from_bytes(value_bytes_o, byteorder='big') 

                avg_r = value_int_r/value_int_o
                

                overallavg_r += avg_r
        if f == 1:
            c+=1
        midavg = overallavg_r/t
        finalr+=midavg

    return finalr/c


def get_total_product_data(pid):
    y = get.get("product_info1", f"product_{pid}")
    total_value = 0
    
    
    # Check if row exists and extract the existing values
    if 'row' in y and len(y['row']) > 0:
        cells = y['row'][0]['cell']
       
        for cell in cells:
            # Extract the column name (e.g., 'sales:1', 'sales:30')
            column_name = cell['column'].decode().split(':')[1]
            
            # Extract the value for the column
            value_bytes = cell['$']
            value_int = int.from_bytes(value_bytes, byteorder='big')
            
            if column_name == 'total':
                # Special handling for 'sales:total'
                total_value = value_int
    
    return total_value


def get_user_prod(cid):
    l = []
    for a1 in range(100, 201):
        y = get.get("user_purchases1", f"user_{cid}_product_{a1}")
        
        if 'row' in y and len(y['row']) > 0:
            cells = y['row'][0]['cell']
            
            # Extract purchase information (assuming it's a list of integers)
            x = []
            for a in range(len(cells)):
                value_bytes_r = cells[a]['$'] 
                value_int_r = int.from_bytes(value_bytes_r, byteorder='big') 
                x.append(value_int_r)
            
            # Look up the product name and image using the product ID (a1)
            if a1 in products:
                product_info = products[a1]
                name = product_info['name']
                image = product_info['link']
                l.append((a1, x, image, name))
            else:
                # If the product is missing from the CSV, append None or empty values
                l.append((a1, x, None, None))
    
    return l

def get_user_recc(cid):
    recommendations = []
    print(products)
    with open('D:/py3.11/user_recommendations.csv', mode='r') as file:
        reader = csv.DictReader(file)
        
        # Iterate over each row to find the matching cid
        for row in reader:
            if int(row['cid']) == int(cid):
                recommendations = eval(row['recommendations'])
                break
    ret = []
    for a in recommendations:
        print(a, ">>>>>>>>>>", a[0], ">>>>>>>>>>>", products[int(a[0])])
        ret.append([int(a[0]), products[int(a[0])]['name'], products[int(a[0])]['link']])
    
    return ret

def get_user_all():
    users = []
    for a in products:
        users.append([a, products[a]['name'], products[a]['link']])
    return users


def placeorder(c, p , q, r):
    order = {
            'cid': c,  # Customer ID
            'pid': p,      # Invoice Number
            'quantity': q,       # Quantity
            'review': r      # Review
        }
    print("?????????????????????????????????????????????????",order)
    try:
        producer.send('demo', value=order)
    except:
        return False
    return True



producer = KafkaProducer(bootstrap_servers=['localhost:9092'], value_serializer=lambda x:dumps(x).encode('utf-8'))
user_data = load_user_data()
user_data_id = load_user_data_id()
products = load_products()

@app.route('/check_username', methods=['POST'])
def check_username():
    data = request.json
    username = data.get('username')

    if username in user_data:
        return jsonify({"exists": True, "userid": user_data[username]['userid'], "profile_picture": user_data[username]['profile_picture']}), 200
    else:
        return jsonify({"exists": False}), 404
    
@app.route('/get_profile', methods=['POST'])
def check_userid():
    data = request.json
    username = data.get('cid')

    if username in user_data_id:
        return jsonify({"exists": True, "username": user_data_id[username]['username'], "pp": user_data_id[username]['profile_picture']}), 200
    else:
        return jsonify({"exists": False}), 404
    

@app.route('/analysis', methods=['GET'])
def get_pp():
    crating = []
    cquantity = []
    for a in range(100, 201):
        x2 = get_average_customer_rate(a)
        x3 = get_average_selling_rate(a)
        crating.append(x2)
        cquantity.append(x3)

    return jsonify({"exists": True, 'avg_cust':crating, 'avg_prod':cquantity}), 200
        

    
@app.route('/product', methods=['GET'])
def get_product():
    l = []
    lt = []

    for a in range(100, 201):
        x = [a]
        info = get_product_data(a)
        x.append(info)
        l.append(x)
        xt = [a]
        infot = get_total_product_data(a)
        xt.append(infot)
        lt.append(xt)
        

    y1 = get.get("orders", "tt")
    x=0
    if 'row' in y1 and len(y1['row']) > 0:
        total_value = y1['row'][0]['cell'][0]['$']
        x = int.from_bytes(total_value, byteorder='big')
    
    return jsonify({"exists": True, "info":l, "infototal":lt, "total":x}), 200

@app.route('/recommend', methods=['POST'])
def get_recc():
    data = request.json
    cid = data.get('cid')
    info = get_user_prod(cid)
    recc = get_user_recc(cid)
    all = get_user_all()
   
    return jsonify({"exists": True, "info":info, "recc":recc, "all":all}), 200

@app.route('/realtime', methods=['POST'])
def get_realtime():
    data = request.json
    pid = data.get('pid')
    x = get_product_data(pid)
    x2 = get_average_customer_rate(pid)
    x3 = get_average_selling_rate(pid)
    print(x)
    return jsonify({"exists": True, "info":pid, "data":x, 'avg_cust':x2, 'avg_prod':x3}), 200

@app.route('/satisfaction', methods=['GET'])
def get_realtimetotal_statis():
    x = get_customer_satisfaction
    return jsonify({"exists": True,"satis":x}), 200



@app.route('/realtimetotal', methods=['GET'])
def get_realtimetotal():
    lt = []
    for a in range(100, 201):
        xt = [a]
        infot = get_total_product_data(a)
        xt.append(infot)
        lt.append(xt)

    total_value = 0
    y1 = get.get("orders", "tt")
    x=0
    if 'row' in y1 and len(y1['row']) > 0:
        total_value = y1['row'][0]['cell'][0]['$']
        x = int.from_bytes(total_value, byteorder='big')

    
    return jsonify({"exists": True, "data":lt, "total":x}), 200

@app.route('/placeorder', methods=['POST'])
def place_order():
    print("what")
    data = request.json
    pid = data.get('pid')
    cid = data.get('cid')
    quantity = data.get('quantity')
    review = data.get('review')
    x = placeorder(int(pid), int(cid), int(quantity), int(review))
    return jsonify({"success": x}), 200


if __name__ == '__main__':
    app.run(debug=True)
