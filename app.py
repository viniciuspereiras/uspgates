from flask import Flask, render_template, request, redirect, make_response
from datetime import datetime, timedelta
from db import session as db_session
from db import Status
from flask_session import Session
import json



app = Flask(__name__)
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

static = '/static'

# configure static
app.config['STATIC_FOLDER'] = static


@app.route('/')
def index():
    gate_name = 'Geotec'    
    return render_template('index.html', gate_name=gate_name)


@app.route('/api/send_status', methods=['POST'])
def send_status():
    timestamp = datetime.now()
    # get json data posted
    data = request.get_json()

    status = data['status']
    date_time = data['date_time']
    if date_time != datetime.now().strftime('%Y-%m-%d'):
        return make_response('{"operation": "error", "description": "Data invalida"}', 500)

    user_cookie = request.cookies.get('session')
    if status not in ['0', '1']:
        return make_response('{"operation": "error", "description": "Status invalido"}', 500)
    #check if this user already sended a status in last 3 hours
    three_hours_ago = datetime.now() - timedelta(hours=3)
    status = db_session.query(Status).filter(Status.timestamp >= three_hours_ago).filter(Status.user_session == user_cookie).first()
    if status:
        return make_response('{"operation": "error", "description": "Status ja enviado nas ultimas 3 horas"}', 500)
    new_status = Status(timestamp=timestamp, status=status, user_session=user_cookie)
    db_session.add(new_status)
    db_session.commit()
    return make_response('{"operation": "ok", "description":"Status enviado com sucesso"}', 200)
    

@app.route('/api/get_status', methods=['GET'])
def get_status():
    if 'date' in request.args:
        date = request.args['date']
        # get all status
        status = db_session.query(Status).all()

        filtered_status = []
        for db_date in status:
            if db_date.timestamp.strftime('%Y-%m-%d') == date:
                
                filtered_status.append(db_date)

        status = filtered_status

        if status: 
            status_response = []
            for s in status:
                status_response.append({'timestamp': s.timestamp.isoformat(), 'status': s.status})
            # contenttype
            response = make_response(json.dumps(status_response))
            response.headers['Content-Type'] = 'application/json'
            return response
        else:
            return make_response('{"operation": "error", "description": "Nenhum status encontrado"}', 500)
    else:
        return make_response('{"operation": "error", "description": "Nenhum status encontrado"}', 500)



app.run(debug=True, host='0.0.0.0', port=5000)