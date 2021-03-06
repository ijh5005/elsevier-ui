import React, { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";

import Table from "./components/Table";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 60 * 1000 * 4
});

const filter = (filters, resourceText) => {
  axiosInstance.get("/filter", {
    filters,
	  resourceText
  })
}

const App = () => {
  
  const [fetchedData, setFetchedData] = useState(false);
  const [list, setList] = useState([]);
  const [resources, setResources] = useState([]);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const heads = ["Clinical Status", "Date Recorded", "Verification Status", "Resource"];

  const sort = (data) => {
    if(data === "Resource"){
      const filtered = list.filter(data => data.resource);
      const newList = filtered.sort(function (a, b) {
        if (a.resource < b.resource) { return -1 }
        if (a.resource > b.resource) { return 1 }
        return 0;
      })
      setList(newList)
    } else if(data === "Date Recorded"){
      const filtered = list.filter(data => data.dateRecorded);
      const newList = filtered.sort((a, b) => {
        const date1 = new Date (a.dateRecorded)
        const date2 = new Date (b.dateRecorded)
        return date1 - date2;
      });
      setList(newList)
    }
  }

  useEffect(() => {
    axiosInstance.get("/").then(results => {
      const {
        data
      } = results;
      const list = data.data.map(d => ({
        clinicalStatus: d.resource.clinicalStatus,
        dateRecorded: d.resource.dateRecorded,
        verificationStatus: d.resource.verificationStatus,
        resource: d.resource.code.text
      }));
      setList(list)
      setResources(data.data.map(d => d.resource.code.text))
      setFetchedData(true)
    })
    axiosInstance.get("/personal").then(results => {
      const {
        data
      } = results;
      setName(data.name)
      setDob(data.dob)
      setGender(data.gender)
    })
  }, []);

  const fetchData = (clinicalStatus, verificationStatus, resource) => {
    const obj = {
      "filters": [],
      "resourceText": ""
    }

    if(clinicalStatus){
      obj.filters.push(clinicalStatus)
    }

    if(verificationStatus){
      obj.filters.push(verificationStatus)
    }

    if(resource){
      obj.filters.push("resource");
      obj.resourceText = resource;
    }

    axiosInstance.post("/filter", obj).then(results => {
      const {
        data
      } = results;
      const list = data.data.map(d => ({
        clinicalStatus: d.resource.clinicalStatus,
        dateRecorded: d.resource.dateRecorded,
        verificationStatus: d.resource.verificationStatus,
        resource: d.resource.code.text
      }));
      setList(list)
      setResources(data.data.map(d => d.resource.code.text))
    })
  }

  return (
    <div className="App">
      { !fetchedData ? <p>loading</p> :
        <Table
          list={list}
          heads={heads}
          resources={resources}
          fetchData={fetchData}
          name={name}
          dob={dob}
          gender={gender}
          sort={sort}
        />
      }
    </div>
  );
}

export default App;
