// Tasks API composable
export const useTasksApi = () => {
  const { apiCall } = useApi();

  // Task Lists
  const fetchTaskLists = async () => {
    return await apiCall('get_task_lists.php');
  };

  const createTaskList = async (name, color) => {
    return await apiCall('create_task_list.php', {
      method: 'POST',
      body: { name, color },
    });
  };

  const updateTaskList = async (id, name, color) => {
    return await apiCall('update_task_list.php', {
      method: 'POST',
      body: { id, name, color },
    });
  };

  const deleteTaskList = async (id) => {
    return await apiCall('delete_task_list.php', {
      method: 'POST',
      body: { id },
    });
  };

  // Tasks
  const fetchTasks = async (listId = null) => {
    const endpoint = listId
      ? `get_tasks.php?list_id=${listId}`
      : 'get_tasks.php';
    return await apiCall(endpoint);
  };

  const createTask = async (taskData) => {
    return await apiCall('create_task.php', {
      method: 'POST',
      body: taskData,
    });
  };

  const updateTask = async (taskData) => {
    return await apiCall('update_task.php', {
      method: 'POST',
      body: taskData,
    });
  };

  const toggleTask = async (id, completed) => {
    return await apiCall('toggle_task.php', {
      method: 'POST',
      body: { id, completed },
    });
  };

  const deleteTask = async (id) => {
    return await apiCall('delete_task.php', {
      method: 'POST',
      body: { id },
    });
  };

  const deleteCompletedTasks = async (listId = null) => {
    return await apiCall('delete_completed_tasks.php', {
      method: 'POST',
      body: { list_id: listId },
    });
  };

  // List Sharing
  const fetchAllUsers = async () => {
    return await apiCall('get_all_users.php');
  };

  const fetchListShares = async (listId) => {
    return await apiCall(`get_list_shares.php?list_id=${listId}`);
  };

  const shareTaskList = async (listId, sharedWithUserId, permissionLevel) => {
    return await apiCall('share_task_list.php', {
      method: 'POST',
      body: {
        list_id: listId,
        shared_with_user_id: sharedWithUserId,
        permission_level: permissionLevel,
      },
    });
  };

  const unshareTaskList = async (listId, sharedWithUserId) => {
    return await apiCall('unshare_task_list.php', {
      method: 'POST',
      body: {
        list_id: listId,
        shared_with_user_id: sharedWithUserId,
      },
    });
  };

  // Image Upload
  const uploadTaskImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const { apiBase, getAuthToken } = useApi();

    // Use native fetch for FormData uploads
    const response = await fetch(`${apiBase}/upload_task_image.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload image');
    return await response.json();
  };

  return {
    // Task Lists
    fetchTaskLists,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    // Tasks
    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    deleteCompletedTasks,
    // Sharing
    fetchAllUsers,
    fetchListShares,
    shareTaskList,
    unshareTaskList,
    // Upload
    uploadTaskImage,
  };
};
