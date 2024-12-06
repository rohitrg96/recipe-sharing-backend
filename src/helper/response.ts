export const responseStatus = (res: any, status: any, message: any, data: any) => {
  if (status === 200) {
    res.status(status).json({
      statusMessage: 'Success',
      status,
      message,
      data,
    });
  } else if (status === 400) {
    res.status(status).json({
      statusMessage: 'Error',
      status,
      message,
      data,
    });
  } else if (status === 204) {
    res.status(200).json({
      statusMessage: 'Error',
      status,
      message,
      data,
    });
  } else if (status === 500) {
    res.status(status).json({
      statusMessage: 'Error',
      status,
      message,
      err: data,
    });
  } else if (status === 403) {
    res.status(status).json({
      statusMessage: 'Forbidden',
      status,
      message,
      forbidden: data,
    });
  } else if (status === 401) {
    res.status(status).json({
      statusMessage: 'Invalid credentials',
      status,
      message,
      forbidden: data,
    });
  } else if (status === 404) {
    res.status(status).json({
      statusMessage: 'Method not found',
      status,
      message,
      err: data,
    });
  } else if (status === 409) {
    res.status(status).json({
      statusMessage: 'Already existed',
      status,
      message,
      err: data,
    });
  }
};
