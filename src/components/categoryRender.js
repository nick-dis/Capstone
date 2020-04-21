import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import PouchDB from "pouchdb";

const categoryRender = observer(
  class CategoryRender extends Component {

// --- PROPS ---
// currentQ: is the current Queue 
// ETA: is how long the student will have to wait to see the Tutor
// error: passes any errors that happens. 
// --- PROPS ---
    constructor(props) {
      super(props);
      this.state = {
        currentQ: this.props.currentQ,
        ETA: this.props.ETA,
        error: false
      };
    }

   
    handleWaitlist = () => {
      //works off student ID now
      //might have to add some methods to clear?
      //unsure at this time
      let sID = sessionStorage.getItem("studentID");
      if (sID) {
        this.props.catStore.Waitlist(this.props.name, sID);
      } else alert("Missing student ID");
    };

    sendSMS = async () => {
      let sID = sessionStorage.getItem("studentID");
      let db = new PouchDB(
        "https://b705ce6d-2856-466b-b76e-7ebd39bf5225-bluemix.cloudant.com/students"
      );

      let sInfoPromise = new Promise((resolve, reject) => {
        db.get(sID)
          .then(function(doc) {
            resolve(doc);
          })
          .catch(function(err) {
            reject(err);
          });
      });

      let sInfo = await sInfoPromise;

      let message = {
        to: "+1" + sInfo.phone,
        body:
          "You have entered the queue for " +
          this.props.name +
          " tutoring. \n Your appointment should be ready in " +
          this.props.ETA +
          " minutes. \n Thank you for using Learner Success Services"
      };

      //console.log(message);
      fetch("/SMS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      }).then(res => {
        res.json();
        console.log(res);
      });
    };

    handleWaitAndSMS = () => {
      this.handleWaitlist();
      this.sendSMS();
    };

    render() {
      return (
        <div className="col catCard">
          <div className="card">
            <div className="card-header">{this.props.name}</div>
            <div className="card-body">
              <p>{this.props.desc}</p>
              <span>
                <h5>
                  Queue : <b>{this.props.currentQ}</b>
                </h5>
              </span>
              <span>
                <h6>
                  ETA : <b>{this.props.ETA}</b>
                </h6>
              </span>
              <Link to="/waitlisted">
                <button
                  className="btn btn-dark"
                  onClick={this.handleWaitAndSMS}
                >
                  Waitlist
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }
);

export default categoryRender;
