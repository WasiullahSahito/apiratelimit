// A simplified auth controller for demonstration
exports.signup = async (req, res) => {
    res.status(201).json({ message: 'User registered successfully!' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // IMPORTANT: For the throttler to only count FAILED attempts,
    // you would reset the counter on a successful login.
    // if (loginSuccess) {
    //   req.slowDown.reset(); // Reset the counter for this key (IP)
    //   return res.status(200).json({ message: 'Login successful!' });
    // }

    if (email === 'test@example.com' && password === 'password123') {
        // On successful login, reset the counter for this IP
        if (req.slowDown) req.slowDown.reset();
        res.status(200).json({ message: 'Login successful!', token: 'dummy-jwt-token' });
    } else {
        // This is a failed attempt, so the throttler counter will increment.
        res.status(401).json({ message: 'Invalid credentials' });
    }
};