import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./authentication";
import { useNavigate } from "react-router-dom";
import { LandingPageImage, Apptext } from "./landing";
import { TextField } from "./login";
import { ReactMultiEmail } from "react-multi-email";
import "react-multi-email/dist/style.css";



export async function marksSharedTasksAsOverdue(userId, token) {
    if (!userId) {
        return {
            success: false,
            message: 'user ID is required',
            data: [],
            status: 500,

        }
    }

    try {
        const response = await fetch(`http://localhost:8081/markSharedOverdue/${userId}`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'overdue shared Tasks marked successfully',
                data,
                status: response?.status,
            }
        } else {
            throw new Error('failed to mark shared task over due');
        }
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: error.message,
            data: [],
            status: 500,
        }
    }

}

const SharedDashboardPage = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [sharedTasks, setSharedTasks] = useState([]);
    const [showCompletedOrOverdue, setshowCompletedOrOverdue] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [username, setUsername] = useState("");
    const [emails, setEmails] = useState([]);
    const [focused, setFocused] = useState(false);


    const handleDateChange = (e) => {
        setDueDate(e.target.value);
    };


    const fetchUsername = useCallback(async () => {

        if (!user?.id) return;

        try {
            const response = await fetch(`http://localhost:8081/user/${user.id}`,

                {
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUsername(data.username);
        } catch (error) {
            console.log("Did not find username in db");
            console.error("Error fetching username:", error);
        }
    }, [user, token]);


    const EmailFeild = () => {

        return (
            <div>
                <ReactMultiEmail
                    placeholder="enter emails"
                    emails={emails}
                    onChange={(_emails) => {
                        setEmails(_emails);
                    }}
                    autoFocus={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    getLabel={(email, index, removeEmail) => {
                        return (
                            <div data-tag key={index}>
                                <div data-tag-item>{email}</div>
                                <span data-tag-handle onClick={() => removeEmail(index)}>
                                    ×
                                </span>
                            </div>
                        );
                    }}
                />
            </div>
        );
    }

    const handleMarkOverdue = useCallback(async () => {
        if (!user?.id) return;

        const result = await marksSharedTasksAsOverdue(user.id, token);

        if (result.success) {
            console.log(result.message);
        } else {
            console.error(result.message);
        }
    }, [user?.id, token]);

    const fetchSharedTasks = useCallback(async () => {
        if (!user?.id) {
            console.log("user id not found");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/sharedTasks/${user.id}`, {
                credentials: "include",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSharedTasks(data);
                handleMarkOverdue();
            } else {
                console.error("failed to fetch user tasks");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, [handleMarkOverdue, token, user]);

    const handleSharedTaskAdd = async () => {
        const formattedDate = new Date(dueDate).toISOString();

        try {
            const response = await fetch(`http://localhost:8081/createSharedTask/${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    dueDate: formattedDate,
                    emails,
                    status: "pending",
                }),
            });

            if (response.ok) {
                fetchSharedTasks();
                setShowDialog(false);
                setTitle("");
                setDescription("");
                setDueDate("");
                setEmails([]);
            } else {
                const errorData = await response.json();
                console.error("Error adding tasks:", errorData);
                return;
            }
        } catch (error) {
            console.error("Error adding tasks:", error);
        }
    };


    const handleUpdateSharedTaskStatus = async (sharedTaskID) => {
        try {
            await fetch(`http://localhost:8081/updateSharedTask/${sharedTaskID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "completed" }),
            });
            //awiat markoverdue
            fetchSharedTasks()
        } catch (error) {
            console.error("Error updating shared task Status", error);
        }
    }


    const handleDeleteSharedtask = async (sharedTaskID) => {
        try {
            await fetch(`http://localhost:8081/deleteSharedTask/${sharedTaskID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            //await markoverdue
            fetchSharedTasks();
        } catch (error) {
            console.error("error deleting shared task");
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8081/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            logout();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };







    const TaskList = ({ tasks, showCompletedOrOverdue, handleUpdateSharedTaskStatus, handleDeleteSharedtask }) => {
        const currentDate = new Date().toLocaleString("sv-SE").replace("T", " ");


        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasks.length === 0 ? (
                    <div style={{
                        backgroundColor: "#6abce2",
                        color: "#fff",
                        padding: "15px",
                        borderRadius: "8px",
                        textAlign: "center",
                    }}>
                        No tasks available
                    </div>
                ) : (
                    tasks
                        .filter(task => showCompletedOrOverdue ? task.status === "completed" : (task.status === "pending" || task.status === "overdue"))
                        .map(task => {
                            const isOverdue = (task.status === "pending" && task.dueDate < currentDate) || task.status === "overdue";


                            return (
                                <div key={task.id} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: "#6abce2",
                                    color: "#fff",
                                    opacity: "0.9",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontWeight: "bold", fontSize: "20px" }}>{task.title}</span>:
                                        <span style={{ fontWeight: "italic", fontSize: "18px" }}>{task.description}</span>
                                    </div>

                                    <div>
                                        <span style={{
                                            fontWeight: "italic",
                                            fontSize: "18px",
                                            color: isOverdue ? "red" : "white"
                                        }}>
                                            {task.dueDate}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                        <input
                                            type="checkbox"
                                            checked={task.status === "completed"}
                                            onChange={() => handleUpdateSharedTaskStatus(task.id)}
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                cursor: "pointer",
                                                accentColor: "green",
                                            }}
                                        />
                                        <button
                                            onClick={() => handleDeleteSharedtask(task.id)}
                                            style={{ cursor: "pointer", transition: "0.3s" }}
                                        >
                                            delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        );
    };

    const dialogStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        width: "300px",
    };


    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetchSharedTasks();
        fetchUsername();
    }, [user, setshowCompletedOrOverdue, fetchSharedTasks, navigate, handleMarkOverdue, fetchUsername]);

    const toggleView = () => {
        setshowCompletedOrOverdue(!showCompletedOrOverdue);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                margin: "0",
                padding: "5vh 0",
                display: "flex",
                alignItems: "centre",
                flexDirection: "column",
            }}
        >
            <div style={{ padding: "5vh 0" }}>
                <Apptext text="myTodolist" fontSize="70px" fontWeight="bold" top="20px" left="20px" />
                <Apptext text="Get things done , today!" fontSize="30px" fontWeight="italic" top="100px" left="20px" />
                <h1 style={{ color: "black", left: "20px", top: "200px", position: "absolute" }}>Welcome, {username}!</h1>
            </div>
            <div
                style={{
                    flex: "1",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <TaskList
                    tasks={sharedTasks}
                    showCompletedOrOverdue={showCompletedOrOverdue}
                    handleUpdateSharedTaskStatus={handleUpdateSharedTaskStatus}
                    handleDeleteSharedtask={handleDeleteSharedtask}

                />

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <button onClick={toggleView}>
                        {showCompletedOrOverdue ? "View Pending" : "View Completed"}
                    </button>
                    <button onClick={() => setShowDialog(true)}>Add Task</button>
                </div>

                <LandingPageImage />

                {showDialog && (
                    <div style={dialogStyle}>
                        <h3>Add Task</h3>
                        <TextField
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <TextField type="date" lang="en-GB" value={dueDate} onChange={handleDateChange} />
                        <button onClick={handleSharedTaskAdd}>Submit</button>
                        <button onClick={() => setShowDialog(false)}>Cancel</button>

                        <EmailFeild></EmailFeild>
                    </div>
                )}

                <button onClick={() => navigate("/dashboard")}>View Personal Tasks</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export { SharedDashboardPage };
