process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFindByPk = jest.fn();
const mockGenSalt = jest.fn();
const mockHash = jest.fn();
const mockCompare = jest.fn();
const mockSign = jest.fn();

jest.mock("../../models", () => ({
  User: {
    findAll: mockFindAll,
    findOne: mockFindOne,
    create: mockCreate,
    findByPk: mockFindByPk
  }
}));

jest.mock("bcryptjs", () => ({
  genSalt: mockGenSalt,
  hash: mockHash,
  compare: mockCompare
}));

jest.mock("jsonwebtoken", () => ({
  sign: mockSign
}));

const controller = require("../../controllers/auth.controller");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockFindByPk.mockReset();
    mockGenSalt.mockReset();
    mockHash.mockReset();
    mockCompare.mockReset();
    mockSign.mockReset();
  });

  test("register rejects mismatched passwords before touching the model", async () => {
    const req = {
      body: {
        username: "TestUser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Passwords do not match" });
    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("register rejects duplicate emails", async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com"
    });

    const req = {
      body: {
        username: "TestUser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { email: "test@example.com" }
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "User already exists" });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("register hashes the password and stores the new user", async () => {
    mockFindOne.mockResolvedValueOnce(null);
    mockGenSalt.mockResolvedValueOnce("salt");
    mockHash.mockResolvedValueOnce("hashed-password");
    mockCreate.mockResolvedValueOnce({
      id: 3,
      username: "TestUser",
      email: "test@example.com",
      password_hash: "hashed-password"
    });

    const req = {
      body: {
        username: "TestUser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(mockGenSalt).toHaveBeenCalledWith(10);
    expect(mockHash).toHaveBeenCalledWith("password123", "salt");
    expect(mockCreate).toHaveBeenCalledWith({
      username: "TestUser",
      email: "test@example.com",
      password_hash: "hashed-password"
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "user reg successful" });
    expect(next).not.toHaveBeenCalled();
  });

  test("login rejects unknown users", async () => {
    mockFindOne.mockResolvedValueOnce(null);

    const req = {
      body: {
        email: "missing@example.com",
        password: "password123"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockSign).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("login rejects invalid credentials", async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 5,
      username: "TestUser",
      email: "test@example.com",
      password_hash: "hashed-password"
    });
    mockCompare.mockResolvedValueOnce(false);

    const req = {
      body: {
        email: "test@example.com",
        password: "wrong-password"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.login(req, res, next);

    expect(mockCompare).toHaveBeenCalledWith("wrong-password", "hashed-password");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid creds" });
    expect(mockSign).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("login signs a token and sets the cookie", async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 7,
      username: "TestUser",
      email: "test@example.com",
      password_hash: "hashed-password"
    });
    mockCompare.mockResolvedValueOnce(true);
    mockSign.mockReturnValueOnce("signed-token");

    const req = {
      body: {
        email: "test@example.com",
        password: "password123"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.login(req, res, next);

    expect(mockSign).toHaveBeenCalledWith(
      { id: 7, email: "test@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    expect(res.cookie).toHaveBeenCalledWith("token", "signed-token", expect.objectContaining({
      httpOnly: true,
      sameSite: "Lax",
      secure: false
    }));
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged in successfully",
      username: "TestUser"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("logout clears the auth cookie", () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();

    controller.logout(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("token", expect.objectContaining({
      httpOnly: true,
      sameSite: "Lax",
      secure: false
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    expect(next).not.toHaveBeenCalled();
  });

  test("me returns the current user fields only", async () => {
    mockFindByPk.mockResolvedValueOnce({
      username: "TestUser",
      email: "test@example.com"
    });

    const req = {
      user: { id: 7 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.me(req, res, next);

    expect(mockFindByPk).toHaveBeenCalledWith(7, {
      attributes: ["username", "email"]
    });
    expect(res.json).toHaveBeenCalledWith({
      username: "TestUser",
      email: "test@example.com"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("me returns 404 when the user is missing", async () => {
    mockFindByPk.mockResolvedValueOnce(null);

    const req = {
      user: { id: 999 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.me(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    expect(next).not.toHaveBeenCalled();
  });

  test("healthCheck returns the number of users", async () => {
    mockFindAll.mockResolvedValueOnce([
      { id: 1 },
      { id: 2 }
    ]);

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await controller.healthCheck(req, res, next);

    expect(mockFindAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "ok",
      userCount: 2
    });
    expect(next).not.toHaveBeenCalled();
  });
});
