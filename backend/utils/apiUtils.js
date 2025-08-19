// backend/utils/apiUtils.js

/**
 * Tiện ích để xác thực và biến đổi các tham số truy vấn URL
 * Hỗ trợ giá trị mặc định, chuyển đổi kiểu và xác thực
 */

/**
 * Chuyển đổi một tham số truy vấn URL từ string sang kiểu dữ liệu mong muốn
 * @param {string} value Giá trị tham số truy vấn
 * @param {string} type Kiểu dữ liệu mong muốn: 'string', 'number', 'boolean', 'date', 'array'
 * @param {any} defaultValue Giá trị mặc định nếu value là undefined
 * @returns {any} Giá trị đã chuyển đổi
 */
export const convertQueryParam = (value, type = 'string', defaultValue = undefined) => {
    // Xử lý undefined hoặc null
    if (value === undefined || value === null) {
        return defaultValue;
    }

    // Chuyển đổi kiểu dữ liệu
    switch (type) {
        case 'string':
            return String(value);
        case 'number':
            const num = Number(value);
            return isNaN(num) ? defaultValue : num;
        case 'boolean':
            return value === 'true' || value === '1';
        case 'date':
            const date = new Date(value);
            return isNaN(date.getTime()) ? defaultValue : date;
        case 'array':
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return value.split(',').map(v => v.trim());
            return defaultValue;
        default:
            return value;
    }
};

/**
 * Xây dựng đối tượng filter từ các tham số truy vấn cho mongoose
 * @param {Object} query Đối tượng req.query
 * @param {Object} config Cấu hình cho từng tham số
 * @returns {Object} Đối tượng filter cho mongoose
 * 
 * @example
 * // Cấu hình
 * const config = {
 *   search: { path: 'name', type: 'regex' },
 *   category: { path: 'category', type: 'exact' },
 *   minPrice: { path: 'price', type: 'gte' },
 *   maxPrice: { path: 'price', type: 'lte' },
 *   tags: { path: 'tags', type: 'in', isArray: true },
 *   from: { path: 'createdAt', type: 'gte', dataType: 'date' },
 *   to: { path: 'createdAt', type: 'lte', dataType: 'date' }
 * };
 * const filter = buildMongooseFilter(req.query, config);
 */
export const buildMongooseFilter = (query, config) => {
    const filter = {};

    Object.keys(config).forEach(param => {
        const value = query[param];
        if (value === undefined || value === '') return;

        const { path, type, isArray = false, dataType = 'string' } = config[param];
        
        // Chuyển đổi giá trị sang kiểu dữ liệu phù hợp
        let convertedValue;
        if (isArray) {
            convertedValue = convertQueryParam(value, 'array');
            // Chuyển đổi từng phần tử trong mảng
            if (convertedValue) {
                convertedValue = convertedValue.map(v => convertQueryParam(v, dataType));
            }
        } else {
            convertedValue = convertQueryParam(value, dataType);
        }

        // Bỏ qua nếu giá trị không hợp lệ
        if (convertedValue === undefined || convertedValue === null) return;

        // Xây dựng phần tử filter dựa trên loại so sánh
        switch (type) {
            case 'exact':
                filter[path] = convertedValue;
                break;
            case 'regex':
                filter[path] = { $regex: convertedValue, $options: 'i' };
                break;
            case 'in':
                filter[path] = { $in: isArray ? convertedValue : [convertedValue] };
                break;
            case 'gt':
                filter[path] = { ...filter[path], $gt: convertedValue };
                break;
            case 'gte':
                filter[path] = { ...filter[path], $gte: convertedValue };
                break;
            case 'lt':
                filter[path] = { ...filter[path], $lt: convertedValue };
                break;
            case 'lte':
                filter[path] = { ...filter[path], $lte: convertedValue };
                break;
            default:
                filter[path] = convertedValue;
        }
    });

    return filter;
};

/**
 * Tạo đối tượng tùy chọn phân trang cho mongoose
 * @param {Object} query Đối tượng req.query
 * @param {Object} defaultOptions Tùy chọn mặc định
 * @returns {Object} Đối tượng tùy chọn phân trang { page, limit, skip, sort }
 */
export const getPaginationOptions = (query, defaultOptions = {}) => {
    const page = Math.max(1, convertQueryParam(query.page, 'number', 1));
    const limit = Math.max(1, Math.min(100, convertQueryParam(query.limit, 'number', defaultOptions.limit || 20)));
    const skip = (page - 1) * limit;
    
    // Xử lý tùy chọn sắp xếp
    let sort = defaultOptions.sort || { createdAt: -1 };
    if (query.sort) {
        const sortFields = query.sort.split(',');
        sort = {};
        
        sortFields.forEach(field => {
            if (field.startsWith('-')) {
                sort[field.substring(1)] = -1;
            } else {
                sort[field] = 1;
            }
        });
    }
    
    return { page, limit, skip, sort };
};
