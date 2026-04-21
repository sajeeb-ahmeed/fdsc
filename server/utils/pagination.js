/**
 * Paginates a Mongoose query and returns a standardized envelope.
 * @param {import('mongoose').Model} model - The Mongoose model to query.
 * @param {Object} query - The filter query.
 * @param {Object} options - Pagination options (page, limit, populate, sort).
 * @returns {Promise<Object>} The standardized pagination envelope.
 */
const paginate = async (model, query = {}, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(query)
            .sort(options.sort || { createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(options.populate || ''),
        model.countDocuments(query)
    ]);

    return {
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};

module.exports = paginate;
