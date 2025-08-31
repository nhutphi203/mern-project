const useMediaRecords = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMediaRecords = async (appointmentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await mediaRecordApi.getForAppointment(appointmentId);
            return result.mediaRecords;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadMediaRecord = async (appointmentId, file, description) => {
        setLoading(true);
        setError(null);
        try {
            const result = await mediaRecordApi.upload(appointmentId, file, description);
            return result.mediaRecord;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMediaRecord = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await mediaRecordApi.delete(id);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchMediaRecords,
        uploadMediaRecord,
        deleteMediaRecord,
        loading,
        error,
    };
};
