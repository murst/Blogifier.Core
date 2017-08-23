using System;

namespace Blogifier.Core.Data.Domain
{
    public class BaseEntity
    {
        [System.ComponentModel.DataAnnotations.Schema.DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)]
        [System.ComponentModel.DataAnnotations.Key, System.ComponentModel.DataAnnotations.Schema.Column(Order = 0)]
        public int Id { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
