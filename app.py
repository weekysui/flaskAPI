from flask import Flask,render_template,jsonify
import sqlalchemy
from sqlalchemy import create_engine,inspect,desc
from sqlalchemy.ext.automap import automap_base
Base = automap_base()
engine = create_engine('sqlite:///dataSets/belly_button_biodiversity.sqlite')
Base.prepare(engine, reflect = True)
from sqlalchemy.orm import Session
session = Session(engine)
Otu = Base.classes.otu
Samples = Base.classes.samples
SamplesMetadata = Base.classes.samples_metadata

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/names")
def names():
    inspector = inspect(engine)
    columns = inspector.get_columns("samples")
    names = []
    for column in columns:
        names.append(column["name"])
    names.pop(0)
    return jsonify(names)
@app.route("/otu")
def otu():
    otu_description = session.query(Otu.lowest_taxonomic_unit_found).all()
    otu_description=[x[0] for x in otu_description]
    return jsonify(otu_description)
@app.route("/otu/<otu_id>")
def otuSample(otu_id):
    # dictList = {}
    results = session.query(Otu.lowest_taxonomic_unit_found).filter(Otu.otu_id==otu_id).all()
    
    return jsonify(results)
@app.route("/metadata/<sample>")
def metaSample(sample):
    sample=sample.replace("BB_","")
    results = session.query(
        SamplesMetadata.AGE,
        SamplesMetadata.BBTYPE,
        SamplesMetadata.ETHNICITY,
        SamplesMetadata.GENDER,
        SamplesMetadata.LOCATION,
        SamplesMetadata.SAMPLEID).filter(SamplesMetadata.SAMPLEID==sample).all()
    result = results[0]
    result_dict = {}
    result_dict["AGE"]=result[0]
    result_dict["BBTYPE"]=result[1]
    result_dict["ETHNICITY"]=result[2]
    result_dict["GENDER"]=result[3]
    result_dict["LOCATION"]=result[4]
    result_dict["SAMPLEID"]=result[5]
    return jsonify(result_dict)
@app.route("/wfreq/<sample>")
def wfreq(sample):
    sample = sample.replace("BB_","")
    results = session.query(SamplesMetadata.WFREQ).filter(SamplesMetadata.SAMPLEID==sample).all()
    return jsonify(results[0][0])
@app.route("/samples/<sample>")
def sampleValues(sample):
    query="Samples."+sample
    results = session.query(Samples.otu_id,query).order_by(desc(query)).all()
    otu_ids = []
    sample_values = []
    for x in range(len(results)):
        otu_ids.append(results[x][0])
        sample_values.append(results[x][1])
    otu_dict_list = [{"otu_ids":otu_ids,"sample_values":sample_values}]
    return jsonify(otu_dict_list)
if __name__=="__main__":
    app.run(debug=True)