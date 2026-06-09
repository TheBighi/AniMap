process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const mockGetCountry = jest.fn();
const mockWhereAlpha3 = jest.fn();
const mockFetchAnimeData = jest.fn();
const mockPinCreate = jest.fn();

jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");

  return {
    ...actualFs,
    promises: {
      ...actualFs.promises,
      mkdir: jest.fn(),
      writeFile: jest.fn()
    }
  };
});

jest.mock("country-reverse-geocoding", () => ({
  country_reverse_geocoding: jest.fn(() => ({
    get_country: mockGetCountry
  }))
}));

jest.mock("iso-3166-1", () => ({
  whereAlpha3: mockWhereAlpha3
}));

jest.mock("countries-list", () => ({
  countries: {
    JP: { continent: "AS" },
    FR: { continent: "EU" },
    US: { continent: "NA" }
  }
}));

jest.mock("../../services/anilistApi.js", () => ({
  fetchAnimeData: mockFetchAnimeData
}));

jest.mock("../../models", () => ({
  Pin: {
    create: mockPinCreate
  },
  Region: {},
  sequelize: {},
  Sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn()
  }
}));

const fs = require("fs");
const controller = require("../../controllers/pin.controller");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Pin unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCountry.mockReset();
    mockWhereAlpha3.mockReset();
    mockFetchAnimeData.mockReset();
    mockPinCreate.mockReset();
    fs.promises.mkdir.mockReset();
    fs.promises.writeFile.mockReset();
  });

  test("maps coordinates to the expected region ids", () => {
    mockGetCountry.mockReturnValueOnce({ code: "JPN" });
    mockWhereAlpha3.mockReturnValueOnce({ alpha2: "JP" });
    expect(controller.getRegionIdFromCoordinates("35.6895", "139.6917")).toBe(1);

    mockGetCountry.mockReturnValueOnce({ code: "FRA" });
    mockWhereAlpha3.mockReturnValueOnce({ alpha2: "FR" });
    expect(controller.getRegionIdFromCoordinates("48.8566", "2.3522")).toBe(3);
  });

  test("returns -1 when coordinates cannot be resolved", () => {
    mockGetCountry.mockReturnValueOnce(null);

    expect(controller.getRegionIdFromCoordinates("0", "0")).toBe(-1);
  });

  test("saves a base64 image with the file extension from the mime type", async () => {
    fs.promises.writeFile.mockResolvedValueOnce(undefined);

    const savedPath = await controller.saveBase64Image(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
      "C:\\tmp\\pin-image"
    );

    expect(fs.promises.writeFile).toHaveBeenCalledWith("C:\\tmp\\pin-image.png", "iVBORw0KGgoAAAANSUhEUgAAAAUA", "base64");
    expect(savedPath).toBe("C:\\tmp\\pin-image.png");
  });

  test("rejects pins when the anime lookup does not include the requested title", async () => {
    mockFetchAnimeData.mockResolvedValueOnce(["One Piece"]);

    const req = {
      body: {
        anime: "Naruto",
        animeImage: "data:image/png;base64,aGVsbG8=",
        description: "Missing anime",
        latitude: "35.6895",
        longitude: "139.6917",
        realImage: "data:image/png;base64,aGVsbG8=",
        title: "Rejected Pin"
      },
      user: { id: 12 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.createPin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Anime not found in Anilist",
      animes: ["One Piece"]
    });
    expect(mockPinCreate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects pins without coordinates before writing files or saving to ORM", async () => {
    mockFetchAnimeData.mockResolvedValueOnce(["Naruto"]);

    const req = {
      body: {
        anime: "Naruto",
        animeImage: "data:image/png;base64,aGVsbG8=",
        description: "Missing coordinates",
        latitude: "",
        longitude: "",
        realImage: "data:image/png;base64,aGVsbG8=",
        title: "No Location"
      },
      user: { id: 12 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.createPin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Latitude and longitude are required"
    });
    expect(fs.promises.mkdir).not.toHaveBeenCalled();
    expect(fs.promises.writeFile).not.toHaveBeenCalled();
    expect(mockPinCreate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("creates a pin with the resolved region and authenticated user", async () => {
    mockFetchAnimeData.mockResolvedValueOnce(["Naruto"]);
    mockGetCountry.mockReturnValueOnce({ code: "JPN" });
    mockWhereAlpha3.mockReturnValueOnce({ alpha2: "JP" });
    mockPinCreate.mockResolvedValueOnce({
      id: 7,
      title: "Naruto Pin",
      description: "A ninja adventure",
      animeName: "Naruto",
      userId: 42,
      regionId: 1,
      latitude: "35.6895",
      longitude: "139.6917"
    });
    fs.promises.writeFile.mockResolvedValue(undefined);
    fs.promises.mkdir.mockResolvedValue(undefined);

    const req = {
      body: {
        anime: "Naruto",
        animeImage: "data:image/png;base64,aGVsbG8=",
        description: "A ninja adventure",
        latitude: "35.6895",
        longitude: "139.6917",
        realImage: "data:image/png;base64,aGVsbG8=",
        title: "Naruto Pin"
      },
      user: { id: 42 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.createPin(req, res, next);

    expect(fs.promises.mkdir).toHaveBeenCalledWith(expect.stringContaining("uploads"), { recursive: true });
    expect(mockPinCreate).toHaveBeenCalledWith({
      title: "Naruto Pin",
      description: "A ninja adventure",
      realImageUrl: expect.stringMatching(/^\/uploads\//),
      animeImageUrl: expect.stringMatching(/^\/uploads\//),
      animeName: "Naruto",
      latitude: "35.6895",
      longitude: "139.6917",
      regionId: 1,
      userId: 42
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Pin created successfully",
      pin: expect.objectContaining({
        id: 7,
        title: "Naruto Pin",
        regionId: 1,
        userId: 42
      })
    });
    expect(next).not.toHaveBeenCalled();
  });
});
