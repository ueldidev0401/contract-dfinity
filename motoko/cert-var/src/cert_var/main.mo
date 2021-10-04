/// Simple counter (see `Counter.mo`), but uses `mo:base/CertifiedData` to
/// implement the counter value as a certified variable.
import CD "mo:base/CertifiedData";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";

actor Variable {

  var value : Nat32 = 0;

  /// Helper; should be in base?
  func blobOfNat32(n : Nat32) : Blob {
    let byteMask : Nat32 = 0xff;
    func byte(n : Nat32) : Nat8 { Nat8.fromNat(Nat32.toNat(n)) };
    Blob.fromArray(
      [byte(byteMask << 0 & value),
       byte(byteMask << 8 & value),
       byte(byteMask << 16 & value),
       byte(byteMask << 24 & value)])
  };

  /// Update counter and certificate (via system).
  public func inc() : async Nat32 {
    value += 1;
    CD.set(blobOfNat32(value));
    return value;
  };

  public func set(newValue : Nat32) : async () {
    value := newValue;
    CD.set(blobOfNat32(value));
  };

  /// Returns the current counter value,
  /// and, if available, an unforgeable certificate (from the system) about its authenticity.
  /// When called via update call or inter-canister call, no certificate is present (and not needed,
  /// as in these cases the system already certifies the response)
  public query func get() : async { value : Nat32; certificate : ?Blob } {
    return { value; certificate = CD.getCertificate() }
  };
}
