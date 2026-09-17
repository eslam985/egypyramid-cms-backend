const Genre = require("../../service/genres");

// createGenre(data = {}) // // result.rows[0] || null;
const handleCreateGenre = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await Genre.createGenre(data);

        return res.status(201).json({
            success: true,
            message: `Genre name '${result.name}' created successfully!`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

//  updateGenreById(id, data = {})
const handleUpdateGenreById = async (req, res, next) => {
    try {
        const data = req.body;
        const id = req.params.id;
        
        const result = await Genre.updateGenreById(id, data);

        if(!result)
            return res.status(404).json({success: false, message: "Not Updated Genre"});

        // result.rows[0] || null;
        return res.status(200).json({
            success: true,
            message: `Genre name ${result.name} Updated!`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

// findAllGenres() // result.rows;
const handleFindAllGenres = async (req, res, next) => {
    try {
        const result = await Genre.findAllGenres();

        // برجع 200 دائماً مع المصفوفة سواء فيها عناصر أو فاضية
        return res.status(200).json({
            success: true,
            message: `Found ${result.length} Genre(s)`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// findGenreByName(name) // return result.rows[0] || null;
const handleFindGenreByName = async (req, res, next) => {
    try {
        const name = req.query.name;
        const result = await Genre.findGenreByName(name);

        if(!result)
            return res.status(404).json({success: false, message: "Not Found Genre"});

        return res.status(200).json({
            success: true,
            message: `Found Genre name ${name}`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

// findGenreById(id)
const handleFindGenreById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Genre.findGenreById(id);

        if(!result)
            return res.status(404).json({success: false, message: "Not Found Genre"});

        return res.status(200).json({
            success: true,
            message: `Found Genre Id ${result.id}`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

//  deleteGenreById(id)
const handleDeleteGenreById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Genre.deleteGenreById(id);

        if(!result)
            return res.status(404).json({success: false, message: "Not Found Genre"});

        return res.status(200).json({
            success: true,
            message: `Genre Id ${id} Deleted!`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleCreateGenre,
    handleUpdateGenreById,
    handleFindAllGenres,
    handleFindGenreById,
    handleFindGenreByName,
    handleDeleteGenreById,
}