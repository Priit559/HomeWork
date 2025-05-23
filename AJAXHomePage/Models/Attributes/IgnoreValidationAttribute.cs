using System;

namespace AJAXHomePage.Models.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class IgnoreValidationAttribute : Attribute
    {
    }
}