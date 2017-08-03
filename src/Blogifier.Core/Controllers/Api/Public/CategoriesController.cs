using Blogifier.Core.Data.Domain;
using Blogifier.Core.Data.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Blogifier.Core.Controllers.Api.Public
{
    [Route("blogifier/api/public/[controller]")]
    public class CategoriesController : Controller
    {
        IUnitOfWork _db;
        private readonly ILogger _logger;

        public CategoriesController(IUnitOfWork db, ILogger<BlogController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // GET: blogifier/api/public/categories
        /// <summary>
        /// Get all categories
        /// </summary>
        public IEnumerable<Category> Get()
        {
            return _db.Categories.Find(c => c.LastUpdated >= DateTime.MinValue);            
        }

        // GET: blogifier/api/public/categories/filip-stanek
        /// <summary>
        /// Get all categories for author
        /// </summary>
        [Route("{author}")]
        public IEnumerable<Category> Get(string author)
        {
            Profile profile = _db.Profiles.Single(p => p.Slug == author);
            return _db.Categories.Find(c => c.ProfileId == profile.Id);
        }
    }
}
