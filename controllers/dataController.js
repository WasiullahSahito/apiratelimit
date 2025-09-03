exports.getPublicData = (req, res) => {
    res.status(200).json({ message: 'This is public data, accessible by everyone.' });
};

exports.getProtectedData = (req, res) => {
    res.status(200).json({
        message: "You have accessed protected data successfully!",
        data: [
            { id: 1, value: "Some secret data" },
            { id: 2, value: "More secret stuff" },
        ],
    });
};