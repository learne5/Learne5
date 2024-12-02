import React, { useState, useEffect } from "react";
import Assignment from "./Assignment";
import Form from "../common/Form/Form";
import { URL } from "../../constant";
import { useAuth } from "../../hooks/AuthContext.jsx";
import AssignmentView from "./teacher/AssignmentView.jsx";
import { storage } from "../../firebase/firebase.config.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AssignmentSection = ({ subject }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueDateError, setDueDateError] = useState(false);
  const [files, setFiles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${URL}/assignments/${subject}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAssignments(data.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [subject]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        const storageRef = ref(storage, "/documents/" + selectedFile.name);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        setFiles((prevFiles) => [...prevFiles, downloadUrl]);
        return true;
      } catch (error) {
        console.error("Error uploading file:", error);
        return false;
      }
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  };

  const handleDueDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      setDueDateError(true); // Invalid date
    } else {
      setDueDateError(false); // Valid date
    }
    setDueDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dueDateError || new Date(dueDate) < new Date()) {
      setDueDateError(true);
      return;
    }

    try {
      const response = await fetch(`${URL}/assignments/insert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          files,
          subject,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setTitle("");
        setDescription("");
        setDueDate("");
        setFiles([]);
      } else {
        console.error("Failed to create assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  const fields = [
    {
      id: "title",
      label: "Title",
      type: "text",
      placeholder: "Enter assignment title",
      value: title,
      onChange: setTitle,
      required: true,
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter assignment description",
      value: description,
      onChange: setDescription,
      required: true,
    },
    {
      id: "dueDate",
      label: "Due Date",
      type: "datetime-local",
      value: dueDate,
      onChange: handleDueDateChange,
      min: getCurrentDateTime(),
      required: true,
      error: dueDateError,
    },
    {
      id: "files",
      label: "Files",
      type: "file",
      accept: ".pdf,.doc,.docx,.txt",
      onChange: handleFileUpload,
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-teal-400">
          Assignments for {subject}
        </h1>

        {user.type === "teacher" ? (
          <div>
            <AssignmentView subject={subject} />

            <div className="fixed bottom-10 right-10">
              <button
                className="bg-gradient-to-r from-teal-400 to-teal-600 text-white text-lg font-semibold py-3 px-6 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out flex items-center"
                onClick={() => setOpen(true)}
              >
                New Assignment
              </button>
              {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <Form
                      title="Create New Assignment"
                      fields={fields}
                      onSubmit={handleSubmit}
                      onClose={() => setOpen(false)}
                    />
                    {dueDateError && (
                      <p className="text-red-500 text-sm mt-1 ml-5">
                        Please enter a valid future date and time.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-8">
              {assignments.map((assignment) => (
                <Assignment
                  key={assignment._id}
                  assignment={assignment}
                  className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSection;
