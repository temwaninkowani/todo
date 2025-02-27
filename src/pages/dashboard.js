import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./authentication";
import { useNavigate } from "react-router-dom";
import { LandingPageImage, Apptext } from "./landing";
import { TextField } from "./login";


// fetch tasks
export async function fetchTasks(userId, token) {
    if (!userId) return {
        success: false,
        message: 'user ID is required',
        data: [],
        status: 500,
    }
    try {
        const response = await fetch(`http://localhost:8081/tasks/${userId}`, {
            credentials: "include",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'Tasks fetched successfully',
                data,
                status: response?.status,
            }

        } else {
            throw new Error('failed to fetch user tasks');

        }

    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: error,
            data: [],
            status: 500,
        }

    }
}


export async function marksTasksAsOverdue(userId, token) {
    if (!userId) {
        return {
            success: false,
            message: 'user ID is required',
            data: [],
            status: 500,
        }
    }
    try {
        const response = await fetch(`http://localhost:8081/markOverdue/${userId}`, {
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
                message: 'overdue Tasks marked successfully',
                data,
                status: response?.status,
            }

        } else {
            throw new Error('failed to mark overdue tasks');

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



const DashboardPage = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [showCompletedOrOverdue, setShowCompletedOrOverdue] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [username, setUsername] = useState("");
    const nav = useNavigate();



    const handleDateChange = (e) => {
        setDueDate(e.target.value);
    };


    //change task status in db from pending to overdue
    const handleMarkOverdue = useCallback(async () => {
        if (!user?.id) return;

        const result = await marksTasksAsOverdue(user.id, token);

        if (result.success) {
            console.log(result.message);

        } else {
            console.error(result.message);

        }
    }, [user?.id, token]);


    // handle task fetching
    const handleFetchTasks = useCallback(async () => {



        const response = await fetchTasks(user?.id, token)
        handleMarkOverdue();
        if (!response?.success) {
            // Notify the user tbd

            console.error(response.message)
            return
        }

        setTasks(response?.data)




    }, [handleMarkOverdue, token, user?.id]);

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


    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        handleFetchTasks();
        fetchUsername();
    }, [user, setShowCompletedOrOverdue, handleFetchTasks, fetchUsername, navigate, handleMarkOverdue]);

    const toggleView = () => {
        setShowCompletedOrOverdue(!showCompletedOrOverdue);

    };



    // Handle task addition
    const handleAddTask = async () => {
        const formattedDate = new Date(dueDate).toISOString();


        try {
            const response = await fetch(`http://localhost:8081/addTask/${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, dueDate: formattedDate, status: "pending" }),
            });

            if (response.ok) {
                handleFetchTasks();
                setShowDialog(false);
                setTitle("");
                setDescription("");
                setDueDate("");
            } else {
                const errorData = await response.json();
                console.error("Error adding task:", errorData);
                return;
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleUpdateTaskStatus = async (taskID) => {
        try {
            await fetch(`http://localhost:8081/updateTask/${taskID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "completed" }),
            });
            await handleMarkOverdue()
            handleFetchTasks()
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    // handler to delete tasks
    const handleDeleteTask = async (taskID) => {
        try {
            await fetch(`http://localhost:8081/deleteTask/${taskID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            await handleMarkOverdue();
            handleFetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

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

    const TaskList = ({ tasks, showCompletedOrOverdue, handleUpdateTaskStatus, handleDeleteTask }) => {
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
                                            onChange={() => handleUpdateTaskStatus(task.id)}
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                cursor: "pointer",
                                                accentColor: "green",
                                            }}
                                        />
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
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
        width: "300px"
    };


    return (
        <div style={{
            minHeight: "100vh",
            margin: "0",
            padding: "5vh 0",
            display: "flex",
            alignItems: "centre",
            flexDirection: "column",
        }}>
            <div style={{
                padding: "5vh 0",

            }}>
                <Apptext text="myTodolist" fontSize="70px" fontWeight="bold" top="20px" left="20px" />
                <Apptext text="Get things done , today!" fontSize="30px" fontWeight="italic" top="100px" left="20px" />
                <h1 style={{ color: "black", left: "20px", top: "200px", position: "absolute" }}>Welcome, {username}!</h1>
            </div>
            <div style={{
                flex: "1",
                padding: "20px",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column"


            }}>


                <TaskList
                    tasks={tasks}
                    showCompletedOrOverdue={showCompletedOrOverdue}
                    handleUpdateTaskStatus={handleUpdateTaskStatus}
                    handleDeleteTask={handleDeleteTask}
                />



                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <button onClick={toggleView}>
                        {showCompletedOrOverdue ? "View Pending" : "View Completed"}
                    </button>
                    <button onClick={() => setShowDialog(true)}>Add Task</button>
                </div>
                <LandingPageImage></LandingPageImage>

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
                        <TextField
                            type="date"
                            lang="en-GB"
                            value={dueDate}
                            onChange={handleDateChange}
                        />
                        <button onClick={handleAddTask}>Submit</button>
                        <button onClick={() => setShowDialog(false)}>Cancel</button>
                    </div>


                )}

                <button onClick={() => nav("/sharedDashboard")} >Veiw Shared Tasks</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );

};

export { DashboardPage };
