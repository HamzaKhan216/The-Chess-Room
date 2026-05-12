import zstandard as zstd
import os

TURSO_DIR = r'D:\Hamza\Programs\Anti Gravity\Chess analyzer\Turso'
input_file = os.path.join(TURSO_DIR, 'lichess_db_puzzle.csv.zst')
output_file = os.path.join(TURSO_DIR, 'lichess_db_puzzle.csv')

def decompress():
    print(f"Decompressing {input_file}...")
    if not os.path.exists(input_file):
        print("Input file not found!")
        return

    dctx = zstd.ZstdDecompressor()
    with open(input_file, 'rb') as ifh, open(output_file, 'wb') as ofh:
        dctx.copy_stream(ifh, ofh)
    
    print(f"Done! Decompressed to {output_file}")

if __name__ == "__main__":
    decompress()
