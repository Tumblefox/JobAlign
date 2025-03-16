'use client';

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import hotkeys from 'hotkeys-js';
// Shoelace components
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon";
import SlTextArea from "@shoelace-style/shoelace/dist/react/textarea";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
// Custom components
import Notification from "../components/Notification";


export default function Home() {
  const [notifications, setNotifications] = React.useState([]);

  hotkeys('ctrl+g', (ev) => {
    ev.preventDefault();
    localStorage.removeItem("job-align");
  });

  const addNotification = (newNotification) => {
    setNotifications(
      (prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]
    );
  };

  const checkSession = () => {
    const REQUEST_LIMIT = 3;
    const WAIT_TIME = 1000 * 60 * 60 * 24;

    const savedSession = localStorage.getItem("job-align");
    let currentSession;

    if(savedSession) {
      currentSession = JSON.parse(savedSession);
      const sessionInit = new Date(currentSession.init);
      const dateDiff = Math.abs(Date.now() - sessionInit);

      if(dateDiff < WAIT_TIME) {
        if(currentSession.requests >= REQUEST_LIMIT) {
          const timeUntilTryAgain = new Date(sessionInit.setDate(sessionInit.getDate() + 1)).toLocaleString();

          addNotification({
            id: Date.now(),
            type: "warning",
            message: `Limit of <strong>${REQUEST_LIMIT} requests</strong> per day reached. Try again on:<br /><strong>${timeUntilTryAgain}</strong>`,
          });

          return false;
        }

        currentSession.requests += 1;
        localStorage.setItem("job-align", JSON.stringify(currentSession));
        return true;
      }
    }

    currentSession = {
      init: (new Date()).toJSON(),
      requests: 1
    };

    localStorage.setItem("job-align", JSON.stringify(currentSession));
    return true;
  };

  const setSkillTags = (results) => {
    // results.extracted = {hardSkills, softSkills, rquirements, responsibilities}
    let extractedSkillsString = "";
    [
      {label: "Hard Skills", key: "hardSkills"},
      {label: "Soft Skills", key: "softSkills"},
      // {label: "Requirements", key: "requirements"},
      // {label: "Responsibilities", key: "responsibilities"},
    ].forEach(item => {
      if(!results.extracted[item.key]) {
        return;
      }
      let tags = results.extracted[item.key].reduce(
        (acc, keyword) => {
          return acc + `<div class="flex-none border border-solid p-2">${keyword}</div>`;
        },
        ""
      );

      if(tags === "") {
        return;
      }

      extractedSkillsString += `
        <p class="mb-2 block"><strong>${item.label}</strong></p><div class="mb-2 flex flex-wrap">${tags}</div>
      `;
    });

    if(!extractedSkillsString) {
      return;
    }

    extractedSkillsString += "<hr />"
    document.querySelector("#extracted-skills").innerHTML = extractedSkillsString;
  };

  const retargetExperience = async () => {
    const API = 'https://faopowd08b.execute-api.us-east-1.amazonaws.com/prod/';

    try {
      let requestParams = {};

      [
        "job-description",
        "work-experience"
      ]
      .forEach(id => {
        let value = document.querySelector(`#${id}`)?.value;
        if(value !== "") {
          requestParams[id] = value;
        }
      });

      if(!requestParams["job-description"]) {
        addNotification({
          id: Date.now(),
          type: "primary",
          message: `The Job Description field must be filled in.`,
        });
        return;
      }

      if(!checkSession()) {
        return;
      }

      document.querySelector("#retargeted-result").innerHTML = "";
      document.querySelector(".loading-content").classList.remove("hidden");

      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify(requestParams),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        return;
      }

      const json = await response.json();
      console.log(json);
      const results = json.body;

      setSkillTags(results);

      const title = "<strong>Rewritten Work Experience</strong><br />";
      const newWorkExperience = title + results.workExperience
      .replace(/\*/g, "")
      .replace(/(?:\r\n|\r|\n)/g, "<br />");
      document.querySelector("#retargeted-result").innerHTML = newWorkExperience;
      document.querySelector(".loading-content").classList.add("hidden");
    }
    catch(error) {
      console.log(error.message);
      document.querySelector("retargeted-result").innerHTML = `
        <em className="text-gray-400">Your work experience, rewritten by AI using the job description.</em>
      `;
      document.querySelector(".loading-content").classList.add("hidden");
    }
  };

  return (
    <main className="font-[family-name:var(--font-geist-sans)] p-20 flex flex-col gap-8 items-center">
      <section className="p-2 border-4 border-dashed">
        <h2 className="text-8xl mb-2">
          <SlIcon name="file-earmark-person" /> Job<span className="text-teal-400">Align</span>
        </h2>

        <p>
          <em>Rewrite your work experience to match a job description in seconds with AI.</em>
        </p>
      </section>

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <SlTextArea
          id="job-description"
          className="w-full main-textarea"
          label="1. Job Description"
          placeholder="Add the description for the job of interest"
        >
        </SlTextArea>

        <SlTextArea
          id="work-experience"
          className="w-full main-textarea"
          label="2. Your Work Experience"
          placeholder="Enter the work experience from your resume"
        >
        </SlTextArea>
      </section>

      <section className="w-full">
        <SlButton onClick={retargetExperience}>
          <SlIcon name="crosshair" /> Retarget Experience
        </SlButton>
      </section>

      <section className="w-full p-4 border border-solid">
        <h2 className="text-4xl p-2 border-b-4 border-dashed mb-4">
          <SlIcon name="file-check" /> Results
        </h2>

        <div className="mb-4" id="extracted-skills">
        </div>

        <p id="retargeted-result">
          <em className="text-gray-400">Your work experience, rewritten by AI using the job description.</em>
        </p>

        <SlSpinner className="hidden loading-content" style={{ fontSize: '3rem' }} />
      </section>

      <div className="absolute top-10 right-10">
        {
          notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
              onSlAfterHide={() => {
                setNotifications((prevNotifications) =>
                  prevNotifications.filter((n) => n.id !== notification.id)
                );
              }}
            />
          ))
        }
      </div>
    </main>
  );
}
