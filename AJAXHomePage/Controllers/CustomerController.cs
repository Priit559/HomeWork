using AJAXHomePage.Data;
using AJAXHomePage.Models;
using AJAXHomePage.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AJAXHomePage.Controllers
{
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(
            ApplicationDbContext context, 
            IWebHostEnvironment webHostEnvironment,
            ILogger<CustomerController> logger)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _logger = logger;
        }


        public async Task<IActionResult> Index()
        {
            var customers = await _context.Customers
                .Include(c => c.Country)
                .Include(c => c.City)
                .ToListAsync();

            return View(customers);
        }


        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers
                .Include(c => c.Country)
                .Include(c => c.City)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (customer == null)
            {
                return NotFound();
            }

            var viewModel = new CustomerDetailsVM
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                CountryName = customer.Country.Name,
                CityName = customer.City.Name,
                ProfileImage = customer.ProfileImage
            };

            return View(viewModel);
        }


        public IActionResult Create()
        {
            var viewModel = new CustomerCreateVM
            {
                Countries = new SelectList(_context.Countries, "Id", "Name")
            };
            return View(viewModel);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CustomerCreateVM viewModel)
        {
            try
            {

                ModelState.Remove(nameof(viewModel.Countries));
                ModelState.Remove(nameof(viewModel.Cities));


                var existingCustomer = await _context.Customers
                    .FirstOrDefaultAsync(c =>
                        c.FirstName == viewModel.FirstName &&
                        c.LastName == viewModel.LastName &&
                        c.Email == viewModel.Email);

                if (existingCustomer != null)
                {
                    ModelState.AddModelError("", "A customer with these details already exists.");
                    viewModel.Countries = new SelectList(_context.Countries, "Id", "Name", viewModel.CountryId);
                    if (viewModel.CountryId > 0)
                    {
                        viewModel.Cities = new SelectList(
                            _context.Cities.Where(c => c.CountryId == viewModel.CountryId),
                            "Id", "Name", viewModel.CityId);
                    }
                    return View(viewModel);
                }

                if (ModelState.IsValid)
                {
                    string uniqueFileName = null;
                    if (viewModel.ProfileImage != null)
                    {
                        string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images");
                        Directory.CreateDirectory(uploadsFolder);
                        uniqueFileName = Guid.NewGuid().ToString() + "_" + viewModel.ProfileImage.FileName;
                        string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await viewModel.ProfileImage.CopyToAsync(fileStream);
                        }
                    }

                    var customer = new Customer
                    {
                        FirstName = viewModel.FirstName,
                        LastName = viewModel.LastName,
                        Email = viewModel.Email,
                        CountryId = viewModel.CountryId,
                        CityId = viewModel.CityId,
                        ProfileImage = uniqueFileName
                    };

                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync();
                    
                    _context.ChangeTracker.Clear();

                    _logger.LogInformation("Customer created: {FirstName} {LastName}", customer.FirstName, customer.LastName);

                    TempData["Message"] = "Customer created successfully!";
                    return RedirectToAction(nameof(Index));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer");
                ModelState.AddModelError("", "Unable to create customer. Please try again.");
            }

            viewModel.Countries = new SelectList(_context.Countries, "Id", "Name", viewModel.CountryId);
            if (viewModel.CountryId > 0)
            {
                viewModel.Cities = new SelectList(
                    _context.Cities.Where(c => c.CountryId == viewModel.CountryId),
                    "Id", "Name", viewModel.CityId);
            }
            return View(viewModel);
        }


        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            var viewModel = new CustomerEditVM
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                CountryId = customer.CountryId,
                CityId = customer.CityId,
                ExistingImagePath = customer.ProfileImage,
                Countries = new SelectList(_context.Countries, "Id", "Name", customer.CountryId),
                Cities = new SelectList(_context.Cities.Where(c => c.CountryId == customer.CountryId), "Id", "Name", customer.CityId)
            };

            return View(viewModel);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, CustomerEditVM viewModel)
        {
            if (id != viewModel.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var customer = await _context.Customers.FindAsync(id);
                    if (customer == null)
                    {
                        return NotFound();
                    }

                    customer.FirstName = viewModel.FirstName;
                    customer.LastName = viewModel.LastName;
                    customer.Email = viewModel.Email;
                    customer.CountryId = viewModel.CountryId;
                    customer.CityId = viewModel.CityId;

                    if (viewModel.ProfileImage != null)
                    {
                        if (!string.IsNullOrEmpty(customer.ProfileImage))
                        {
                            string filePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", customer.ProfileImage);
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }

                        string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images");
                        string uniqueFileName = Guid.NewGuid().ToString() + "_" + viewModel.ProfileImage.FileName;
                        string newFilePath = Path.Combine(uploadsFolder, uniqueFileName);
                        using (var fileStream = new FileStream(newFilePath, FileMode.Create))
                        {
                            viewModel.ProfileImage.CopyTo(fileStream);
                        }
                        customer.ProfileImage = uniqueFileName;
                    }

                    _context.Update(customer);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CustomerExists(viewModel.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }

            viewModel.Countries = new SelectList(_context.Countries, "Id", "Name", viewModel.CountryId);
            viewModel.Cities = new SelectList(_context.Cities.Where(c => c.CountryId == viewModel.CountryId), "Id", "Name", viewModel.CityId);
            return View(viewModel);
        }

        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers
                .Include(c => c.Country)
                .Include(c => c.City)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            return View(customer);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Customer/DeleteConfirmed/{id}")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var customer = await _context.Customers.FindAsync(id);
                if (customer == null)
                {
                    return Json(new { success = false, message = "Customer not found" });
                }


                if (!string.IsNullOrEmpty(customer.ProfileImage))
                {
                    string filePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", customer.ProfileImage);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();

                _context.ChangeTracker.Clear();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer {CustomerId}", id);

 
                var customerStillExists = await _context.Customers.AnyAsync(c => c.Id == id);
                if (!customerStillExists)
                {
                    return Json(new { success = true });
                }

                return Json(new { success = false, message = "Error deleting customer" });
            }
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Customer/Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await DeleteConfirmed(id);
        }

        [HttpGet]
        public async Task<IActionResult> Exists(int id)
        {
            var exists = await _context.Customers.AnyAsync(c => c.Id == id);
            return Json(exists);
        }


        // AJAX method to get cities by country
        [HttpGet]
        public async Task<IActionResult> GetCitiesByCountry(int countryId)
        {
            try
            {
                var cities = await _context.Cities
                    .Where(c => c.CountryId == countryId)
                    .Select(c => new { id = c.Id, name = c.Name })
                    .OrderBy(c => c.name)
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {cities.Count} cities for country {countryId}");
                return Json(cities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cities for country {CountryId}", countryId);
                return Json(new { error = "Error loading cities" });
            }
        }

        // AJAX method to add new country
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddCountry([FromBody] Country country)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "Invalid country data" });
                }

                var existingCountry = await _context.Countries
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == country.Code.ToUpper());

                if (existingCountry != null)
                {
                    return Json(new { success = false, message = "Country code already exists" });
                }


                country.Code = country.Code.ToUpper();

                _context.Countries.Add(country);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Country added: {Code} - {Name}", country.Code, country.Name);

                return Json(new { success = true, countryId = country.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding country");
                return Json(new { success = false, message = "Error adding country" });
            }
        }


        [HttpPost]
        public async Task<IActionResult> AddCity([FromBody] City city)
        {
            if (ModelState.IsValid)
            {
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();
                return Json(new { success = true, cityId = city.Id });
            }

            return Json(new { success = false });
        }

        [HttpGet]
        public IActionResult VerifyDatabase()
        {
            try
            {
                var diagnostics = new
                {
                    CountriesCount = _context.Countries.Count(),
                    CitiesCount = _context.Cities.Count(),
                    CustomersCount = _context.Customers.Count(),
                    DatabaseConnection = _context.Database.CanConnect(),
                    Countries = _context.Countries.ToList(),
                    Cities = _context.Cities.ToList(),
                    Customers = _context.Customers.ToList()
                };

                return Json(diagnostics);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}