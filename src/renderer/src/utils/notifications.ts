import { showNotification } from "@mantine/notifications";

export const showErrorNotification = (error: Error) => {
	showNotification({ color: "red", title: "Error", message: error.message });
};

export const showSuccessNotification = (message: string) => {
	showNotification({ color: "green", title: "Success", message });
};
